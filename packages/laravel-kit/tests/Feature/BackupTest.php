<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Mail;
use Okjt\Kit\Backups\BackupCreated;
use Okjt\Kit\Backups\BackupService;
use Okjt\Kit\Http\Controllers\BackupController;
use Okjt\Kit\Tests\Fixtures\User;
use Okjt\Kit\Tests\TestCase;

/** A project's own step after restoring an old backup. */
class ProjectBackups extends BackupService
{
    public static array $restored = [];

    protected function restored(ConnectionInterface $db, array $data, array $existing): void
    {
        self::$restored = array_keys($data);
    }
}

class BackupTest extends TestCase
{
    private string $storage;

    protected function setUp(): void
    {
        parent::setUp();
        $this->storage = sys_get_temp_dir().'/okjt-backups-'.uniqid();
        $this->app->useStoragePath($this->storage);
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->storage);
        parent::tearDown();
    }

    protected function defineRoutes($router): void
    {
        $router->prefix('api/backups')->group(function () use ($router) {
            $router->get('/', [BackupController::class, 'index']);
            $router->post('/', [BackupController::class, 'store']);
            $router->get('/{name}/download', [BackupController::class, 'download']);
            $router->post('/{name}/restore', [BackupController::class, 'restore']);
            $router->delete('/{name}', [BackupController::class, 'destroy']);
        });
    }

    private function backups(): BackupService
    {
        return app(BackupService::class);
    }

    public function test_a_backup_holds_every_data_table_but_not_runtime_state(): void
    {
        $this->person('ann@example.com')->createToken('x');

        $backup = $this->backups()->create('manual');

        $this->assertMatchesRegularExpression('/^backup-\d{8}-\d{6}-manual\.zip$/', $backup['name']);
        $this->assertSame(1 + $this->rowsOutside('users'), $backup['rows']);
        $manifest = $this->backups()->manifest($this->backups()->path($backup['name']));
        $this->assertArrayHasKey('users', $manifest['tables']);
        $this->assertArrayNotHasKey('personal_access_tokens', $manifest['tables']);
        $this->assertArrayNotHasKey('migrations', $manifest['tables']);
    }

    private function rowsOutside(string $table): int
    {
        return collect(DB::connection()->getSchemaBuilder()->getTableListing(schemaQualified: false))
            ->reject(fn ($t) => $t === $table || in_array($t, config('okjt.backups.skipped_tables'), true))
            ->sum(fn ($t) => DB::table($t)->count());
    }

    public function test_restoring_brings_the_data_back_after_a_safety_backup(): void
    {
        $this->person('ann@example.com');
        $backup = $this->backups()->create('manual');
        User::query()->delete();
        $this->person('bo@example.com');

        $result = $this->backups()->restore($backup['name']);

        $this->assertSame(['ann@example.com'], User::pluck('email')->all());
        $this->assertStringEndsWith('-pre-restore.zip', $result['safety_backup']);
        $this->assertCount(2, $this->backups()->list());
    }

    public function test_a_project_service_is_used_and_runs_its_step_after_restoring(): void
    {
        config(['okjt.backups.service' => ProjectBackups::class]);
        $this->assertInstanceOf(ProjectBackups::class, app(BackupService::class));

        $backup = $this->backups()->create('manual');
        $this->backups()->restore($backup['name'], safetyBackup: false);

        $this->assertContains('users', ProjectBackups::$restored);
    }

    public function test_only_backup_names_are_accepted(): void
    {
        $this->expectExceptionMessage('Invalid backup name.');
        $this->backups()->path('../.env');
    }

    public function test_snapshots_follow_the_auto_setting_and_keep_the_newest(): void
    {
        config(['okjt.backups.auto' => false]);
        $this->assertNull($this->backups()->snapshot('pre-import'));

        config(['okjt.backups.auto' => true]);
        $this->assertNotNull($this->backups()->snapshot('pre-import'));
        $this->assertSame(0, $this->backups()->prune('pre-import', 1));
        $this->assertSame(1, $this->backups()->prune('pre-import', 0));
    }

    public function test_scheduled_backups_go_off_site_by_email(): void
    {
        Mail::fake();
        config(['okjt.backups.offsite.email' => 'one@example.com, two@example.com']);

        $this->assertSame(0, Artisan::call('backups:create', ['--label' => 'scheduled', '--offsite' => true]));

        Mail::assertSent(BackupCreated::class, fn (BackupCreated $mail) => $mail->hasTo('one@example.com')
            && $mail->hasTo('two@example.com')
            && count($mail->attachments()) === 1);
        $this->assertStringContainsString('scheduled backup', (new BackupCreated($this->backups()->list()[0], null, 1))->render());
    }

    public function test_the_api_creates_lists_downloads_restores_and_deletes(): void
    {
        $created = $this->postJson('/api/backups')->assertCreated()->json('data');

        $this->getJson('/api/backups')->assertOk()->assertJsonPath('data.0.name', $created['name']);
        $this->get("/api/backups/{$created['name']}/download")->assertOk()->assertHeader('content-type', 'application/zip');
        $this->postJson("/api/backups/{$created['name']}/restore")->assertOk()
            ->assertJsonPath('data.safety_backup', fn ($name) => str_ends_with($name, '-pre-restore.zip'));
        $this->deleteJson("/api/backups/{$created['name']}")->assertOk();
        $this->getJson('/api/backups/backup-20200101-000000.zip/download')->assertNotFound();
    }
}
