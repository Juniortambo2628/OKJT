<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use InvalidArgumentException;
use Okjt\Kit\Backups\BackupService;
use Okjt\Kit\Support\ApiResponse;
use RuntimeException;

/**
 * Backups of the whole database, for platform staff (put the routes behind
 * EnsureSuperadmin):
 *
 *   GET    /backups                  → the backups, newest first
 *   POST   /backups                  { include_uploads? } → a new one
 *   GET    /backups/{name}/download
 *   POST   /backups/{name}/restore   (takes a safety backup first)
 *   POST   /backups/{name}/verify    (restores into a throwaway database)
 *   DELETE /backups/{name}
 */
class BackupController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly BackupService $backups) {}

    public function index()
    {
        return $this->successResponse($this->backups->list());
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['include_uploads' => 'sometimes|boolean']);

        return $this->guard(fn () => $this->createdResponse(
            $this->backups->create('manual', (bool) ($validated['include_uploads'] ?? false)),
            'Backup created'
        ));
    }

    public function download(string $name)
    {
        return $this->guard(fn () => response()->download($this->backups->path($name), $name, [
            'Content-Type' => 'application/zip',
        ]));
    }

    public function restore(string $name)
    {
        return $this->guard(function () use ($name) {
            $result = $this->backups->restore($name);

            return $this->successResponse(
                $result,
                "Restored {$result['restored_rows']} records. A safety backup ({$result['safety_backup']}) was taken first."
            );
        });
    }

    /** Restore into a throwaway in-memory database and compare row counts. */
    public function verify(string $name)
    {
        return $this->guard(function () use ($name) {
            $result = $this->backups->verify($name);

            if ($result['error'] !== null) {
                return $this->errorResponse("Verification failed: {$result['error']}", 422, $result);
            }

            return $this->successResponse(
                $result,
                $result['ok']
                    ? 'Backup verified: every table restored with the expected number of records.'
                    : 'Backup verification found tables that did not restore completely.'
            );
        });
    }

    public function destroy(string $name)
    {
        return $this->guard(function () use ($name) {
            $this->backups->path($name); // validates the name and existence
            $this->backups->delete($name);

            return $this->deletedResponse('Backup deleted');
        });
    }

    /** Map service errors to API responses. */
    private function guard(callable $action)
    {
        try {
            return $action();
        } catch (InvalidArgumentException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }
}
