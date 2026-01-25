<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

class BackupController extends Controller
{
    public function run(): JsonResponse
    {
        // Trigger a backup run (best-effort)
        try {
            Artisan::call('backup:run');
            $output = Artisan::output();

            return response()->json([
                'success' => true,
                'message' => 'Backup started successfully.',
                'output' => $output,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Backup failed: '.$e->getMessage(),
            ], 500);
        }
    }

    public function latest(): JsonResponse
    {
        $disk = Storage::disk('local');
        $path = 'Laravel';

        $files = $disk->files($path);

        $backups = collect($files)
            ->filter(fn ($file) => str_ends_with($file, '.zip'))
            ->map(fn ($file) => [
                'file' => $file,
                'size' => $disk->size($file),
                'last_modified' => $disk->lastModified($file),
            ])
            ->sortByDesc('last_modified')
            ->values()
            ->take(5);

        return response()->json([
            'success' => true,
            'data' => $backups,
        ]);
    }
}


