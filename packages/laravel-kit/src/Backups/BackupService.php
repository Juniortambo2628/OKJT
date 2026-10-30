<?php

namespace Okjt\Kit\Backups;

use Illuminate\Database\ConnectionInterface;
use Illuminate\Http\File as HttpFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Okjt\Kit\Workspace\CurrentWorkspace;
use RuntimeException;
use ZipArchive;

/**
 * Database (and optional uploads) backups that work on any database driver:
 * every table is dumped to JSON inside a zip, so no mysqldump/sqlite3 binary
 * is needed on shared hosting. Restores replace table contents inside a
 * transaction after taking an automatic safety backup.
 *
 * Settings are in okjt.backups. A project that needs more (other upload
 * folders, off-site settings from elsewhere, a step after restoring an old
 * backup) extends this class and names it in okjt.backups.service.
 */
class BackupService
{
    private const NAME_PATTERN = '/^backup-\d{8}-\d{6}(-[a-z0-9-]+)?\.zip$/';

    private const INSERT_CHUNK = 200;

    /** Throwaway connection `verify()` restores into. */
    public const VERIFY_CONNECTION = 'backup_verify';

    public function directory(): string
    {
        $dir = storage_path('app/backups');
        File::ensureDirectoryExists($dir);

        return $dir;
    }

    /**
     * @return array<int, array{name: string, size: int, created_at: string, label: ?string, includes_uploads: bool, tables: int, rows: int}>
     */
    public function list(): array
    {
        return collect(File::files($this->directory()))
            ->filter(fn ($file) => preg_match(self::NAME_PATTERN, $file->getFilename()))
            ->map(fn ($file) => $this->describe($file->getPathname()))
            ->sortByDesc('created_at')
            ->values()
            ->all();
    }

    /**
     * Create a backup zip and return its description.
     *
     * @param  string|null  $label  short tag in the file name, e.g. "manual", "scheduled", "pre-restore"
     */
    public function create(?string $label = 'manual', bool $includeUploads = false): array
    {
        if (! class_exists(ZipArchive::class)) {
            throw new RuntimeException('The PHP zip extension is required for backups.');
        }

        $label = $label ? Str::slug($label) : null;
        $name = 'backup-'.now()->format('Ymd-His').($label ? "-{$label}" : '').'.zip';
        $path = $this->directory().DIRECTORY_SEPARATOR.$name;

        $tables = [];
        $rowCount = 0;
        foreach ($this->dataTables() as $table) {
            $rows = DB::table($table)->get()->map(fn ($row) => (array) $row)->all();
            $tables[$table] = $rows;
            $rowCount += count($rows);
        }

        $manifest = [
            'app' => config('app.name'),
            'created_at' => now()->toIso8601String(),
            'label' => $label,
            'driver' => DB::connection()->getDriverName(),
            'includes_uploads' => $includeUploads,
            'tables' => array_map('count', $tables),
            'rows' => $rowCount,
        ];

        $zip = new ZipArchive;
        if ($zip->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('Could not create the backup file.');
        }
        $zip->addFromString('manifest.json', json_encode($manifest, JSON_PRETTY_PRINT));
        $zip->addFromString('database.json', json_encode($tables, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE));

        if ($includeUploads) {
            foreach ($this->uploadFolders() as $prefix => $dir) {
                $this->addDirectory($zip, $dir, $prefix);
            }
        }
        $zip->close();

        return $this->describe($path);
    }

    /**
     * Replace the database contents with a backup. A "pre-restore" backup is
     * taken first so the restore itself can be undone.
     *
     * @param  string|null  $connection  database connection to restore into (default connection when null)
     * @param  bool  $safetyBackup  take a "pre-restore" backup of the default connection first
     * @return array{restored_tables: int, restored_rows: int, safety_backup: ?string}
     */
    public function restore(string $name, ?string $connection = null, bool $safetyBackup = true): array
    {
        $data = $this->readDatabase($this->path($name));
        $safety = $safetyBackup ? $this->create('pre-restore') : null;

        $db = DB::connection($connection);
        $schema = Schema::connection($connection);
        $existing = array_flip($this->dataTables($connection));
        $restoredTables = 0;
        $restoredRows = 0;

        $schema->disableForeignKeyConstraints();
        try {
            $db->transaction(function () use ($db, $schema, $data, $existing, &$restoredTables, &$restoredRows) {
                // Tables the current schema still has, parents before the tables
                // that reference them: emptied children first (so no cascade
                // wipes restored rows), refilled parents first (so every
                // reference finds its row even where keys can't be switched off).
                $tables = $this->parentsFirst(array_values(array_filter(array_keys($data), fn ($t) => isset($existing[$t]))), $schema);
                foreach (array_reverse($tables) as $table) {
                    $db->table($table)->delete();
                }
                foreach ($tables as $table) {
                    $rows = $data[$table];
                    $columns = array_flip($schema->getColumnListing($table));
                    // Keep only columns the current schema still has.
                    $rows = array_map(fn ($row) => array_intersect_key((array) $row, $columns), $rows);
                    foreach (array_chunk($rows, self::INSERT_CHUNK) as $chunk) {
                        $db->table($table)->insert($chunk);
                    }
                    $restoredTables++;
                    $restoredRows += count($rows);
                }
            });
        } finally {
            $schema->enableForeignKeyConstraints();
        }

        $this->restored($db, $data, $existing);

        return [
            'restored_tables' => $restoredTables,
            'restored_rows' => $restoredRows,
            'safety_backup' => $safety['name'] ?? null,
        ];
    }

    /**
     * After a restore, inside the restored database: bring an old backup up to
     * today's schema where copying columns isn't enough.
     *
     * @param  array<string, array>  $data  the backup's tables
     * @param  array<string, int>  $existing  the tables the schema has (as keys)
     */
    protected function restored(ConnectionInterface $db, array $data, array $existing): void {}

    /**
     * Order $tables so each comes after the tables its foreign keys point to.
     *
     * @param  array<int, string>  $tables
     * @return array<int, string>
     */
    private function parentsFirst(array $tables, \Illuminate\Database\Schema\Builder $schema): array
    {
        $parents = [];
        foreach ($tables as $table) {
            $parents[$table] = array_values(array_intersect(
                array_unique(array_column($schema->getForeignKeys($table), 'foreign_table')),
                $tables,
            ));
        }

        $ordered = [];
        $visit = function (string $table, array $path = []) use (&$visit, &$ordered, $parents) {
            if (isset($ordered[$table]) || isset($path[$table])) {
                return; // done, or a cycle (incl. self-references like guests.parent_guest_id)
            }
            foreach ($parents[$table] as $parent) {
                $visit($parent, $path + [$table => true]);
            }
            $ordered[$table] = true;
        };
        foreach ($tables as $table) {
            $visit($table);
        }

        return array_keys($ordered);
    }

    /**
     * Prove a backup restores cleanly without touching the real database:
     * migrate a throwaway in-memory SQLite database, restore into it and
     * compare every table's row count with the backup's manifest.
     *
     * @return array{name: string, ok: bool, error: ?string, tables: array<int, array{table: string, expected: int, restored: ?int, ok: bool}>}
     */
    public function verify(string $name): array
    {
        $path = $this->path($name);
        $expected = $this->manifest($path)['tables'] ?? null;
        $result = ['name' => $name, 'ok' => false, 'error' => null, 'tables' => []];

        if (! is_array($expected)) {
            $result['error'] = 'The backup has no manifest to verify against.';

            return $result;
        }

        $connection = self::VERIFY_CONNECTION;
        $previous = config("database.connections.{$connection}");
        config(["database.connections.{$connection}" => [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
            'foreign_key_constraints' => true,
        ]]);
        DB::purge($connection);

        try {
            // Migrations (some seed data through models) work on the whole
            // database, never inside one workspace.
            $exitCode = CurrentWorkspace::run(null, fn () => Artisan::call('migrate', ['--database' => $connection, '--force' => true]));
            if ($exitCode !== 0) {
                throw new RuntimeException('Migrating the verification database failed: '.trim(Artisan::output()));
            }

            $this->restore($name, $connection, safetyBackup: false);

            $present = array_flip($this->dataTables($connection));
            foreach ($expected as $table => $count) {
                $restored = isset($present[$table]) ? DB::connection($connection)->table($table)->count() : null;
                $result['tables'][] = [
                    'table' => $table,
                    'expected' => (int) $count,
                    'restored' => $restored,
                    // A table dropped from the schema only matters if it held data.
                    'ok' => $restored === null ? (int) $count === 0 : $restored === (int) $count,
                ];
            }
            $result['ok'] = collect($result['tables'])->every('ok');
        } catch (\Throwable $e) {
            report($e);
            $result['error'] = $e->getMessage();
        } finally {
            DB::purge($connection);
            config(["database.connections.{$connection}" => $previous]);
        }

        return $result;
    }

    /**
     * Copy a backup off-site to every target in offsite() (a filesystem disk
     * and/or email). Failures are reported, never thrown,
     * and never touch the local backup.
     *
     * @return array<int, array{target: string, ok: bool, message: string}>
     */
    public function shipOffsite(array $backup, int $keep = 14): array
    {
        $path = $this->path($backup['name']);
        $offsite = $this->offsite();
        $results = [];

        if ($disk = $offsite['disk'] ?? null) {
            $results[] = $this->attempt("disk:{$disk}", function () use ($disk, $backup, $path, $keep, $offsite) {
                $folder = trim((string) ($offsite['path'] ?? 'backups'), '/');
                $storage = Storage::disk($disk);
                if ($storage->putFileAs($folder, new HttpFile($path), $backup['name']) === false) {
                    throw new RuntimeException("Uploading {$backup['name']} to the \"{$disk}\" disk failed.");
                }
                $pruned = $this->pruneDisk($disk, $folder, $backup['label'] ?? null, $keep);

                return "Uploaded to {$folder}/{$backup['name']}; pruned {$pruned} old copy(ies).";
            });
        }

        $recipients = collect(explode(',', (string) ($offsite['email'] ?? '')))
            ->map(fn ($address) => trim($address))
            ->filter()
            ->values()
            ->all();
        if ($recipients) {
            $results[] = $this->attempt('email:'.implode(',', $recipients), function () use ($recipients, $backup, $path, $offsite) {
                $maxMb = (float) ($offsite['email_max_mb'] ?? 15);
                $attach = File::size($path) <= $maxMb * 1048576;
                $mail = config('okjt.backups.mail');
                Mail::to($recipients)->send(new $mail($backup, $attach ? $path : null, $maxMb));

                return $attach
                    ? 'Emailed with the backup attached.'
                    : "Emailed without attachment (larger than {$maxMb} MB).";
            });
        }

        return $results;
    }

    /** Read a backup's manifest.json (empty when missing or unreadable). */
    public function manifest(string $path): array
    {
        $zip = new ZipArchive;
        if ($zip->open($path) !== true) {
            return [];
        }
        $manifest = json_decode((string) $zip->getFromName('manifest.json'), true) ?: [];
        $zip->close();

        return $manifest;
    }

    /**
     * Safety copy before a risky bulk change; keeps the newest `$keep` with
     * this label. Never blocks the change itself if the backup fails.
     */
    public function snapshot(string $label, int $keep = 10): ?array
    {
        if (! config('okjt.backups.auto')) {
            return null;
        }

        try {
            $backup = $this->create($label);
            $this->prune($backup['label'], $keep);

            return $backup;
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
    }

    public function delete(string $name): void
    {
        File::delete($this->path($name));
    }

    /** Delete the oldest backups carrying `$label`, keeping the newest `$keep`. */
    public function prune(string $label, int $keep): int
    {
        $old = collect($this->list())
            ->where('label', $label)
            ->slice($keep);
        $old->each(fn ($backup) => $this->delete($backup['name']));

        return $old->count();
    }

    /** Absolute path of a named backup, rejecting anything that isn't one. */
    public function path(string $name): string
    {
        if (! preg_match(self::NAME_PATTERN, $name)) {
            throw new InvalidArgumentException('Invalid backup name.');
        }
        $path = $this->directory().DIRECTORY_SEPARATOR.$name;
        if (! File::exists($path)) {
            throw new InvalidArgumentException('Backup not found.');
        }

        return $path;
    }

    /**
     * Delete the oldest copies on an off-site disk carrying `$label`,
     * keeping the newest `$keep`. Names sort chronologically.
     */
    private function pruneDisk(string $disk, string $folder, ?string $label, int $keep): int
    {
        $suffix = $label ? '-'.preg_quote($label, '/') : '';
        $pattern = '/^backup-\d{8}-\d{6}'.$suffix.'\.zip$/';
        $storage = Storage::disk($disk);

        $old = collect($storage->files($folder))
            ->filter(fn ($file) => preg_match($pattern, basename($file)))
            ->sortByDesc(fn ($file) => basename($file))
            ->slice(max(1, $keep))
            ->values();
        if ($old->isNotEmpty()) {
            $storage->delete($old->all());
        }

        return $old->count();
    }

    // ---- What a project changes ---------------------------------------------

    /**
     * Folders a backup "with uploads" includes, as zip folder => path.
     *
     * @return array<string, string>
     */
    protected function uploadFolders(): array
    {
        return ['storage' => storage_path('app/public')];
    }

    /**
     * Where scheduled backups are copied: disk (a filesystem disk), path (its
     * folder), email (comma-separated addresses), email_max_mb.
     */
    protected function offsite(): array
    {
        return (array) config('okjt.backups.offsite');
    }

    /** @return array{target: string, ok: bool, message: string} */
    private function attempt(string $target, callable $action): array
    {
        try {
            return ['target' => $target, 'ok' => true, 'message' => $action()];
        } catch (\Throwable $e) {
            report($e);

            return ['target' => $target, 'ok' => false, 'message' => $e->getMessage()];
        }
    }

    /** @return string[] */
    private function dataTables(?string $connection = null): array
    {
        return collect(Schema::connection($connection)->getTableListing(schemaQualified: false))
            ->reject(fn ($table) => in_array($table, config('okjt.backups.skipped_tables'), true) || str_starts_with($table, 'sqlite_'))
            ->values()
            ->all();
    }

    private function readDatabase(string $path): array
    {
        $zip = new ZipArchive;
        if ($zip->open($path) !== true) {
            throw new RuntimeException('Could not open the backup file.');
        }
        $json = $zip->getFromName('database.json');
        $zip->close();

        $data = $json === false ? null : json_decode($json, true);
        if (! is_array($data)) {
            throw new RuntimeException('The backup file is damaged or incomplete.');
        }

        return $data;
    }

    private function describe(string $path): array
    {
        $manifest = $this->manifest($path);

        return [
            'name' => basename($path),
            'size' => File::size($path),
            'created_at' => $manifest['created_at'] ?? Carbon::createFromTimestamp(File::lastModified($path))->toIso8601String(),
            'label' => $manifest['label'] ?? null,
            'includes_uploads' => (bool) ($manifest['includes_uploads'] ?? false),
            'tables' => count($manifest['tables'] ?? []),
            'rows' => (int) ($manifest['rows'] ?? 0),
        ];
    }

    private function addDirectory(ZipArchive $zip, string $dir, string $prefix): void
    {
        if (! File::isDirectory($dir)) {
            return;
        }
        foreach (File::allFiles($dir) as $file) {
            $zip->addFile($file->getPathname(), $prefix.'/'.str_replace('\\', '/', $file->getRelativePathname()));
        }
    }
}
