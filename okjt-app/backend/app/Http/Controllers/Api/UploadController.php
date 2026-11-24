<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class UploadController extends Controller
{
    public function preflight(Request $request)
    {
        $origin = $request->header('Origin', '*');

        return response('', 204)
            ->header('Access-Control-Allow-Origin', $origin)
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
            ->header('Access-Control-Allow-Credentials', 'true')
            ->header('Access-Control-Max-Age', '86400');
    }

    public function index(Request $request)
    {
        $directory = $request->get('directory', 'uploads');
        $allFiles = Storage::disk('public')->allFiles($directory);

        $files = collect($allFiles)->map(function ($path) {
            $url = url('/api/storage/'.ltrim($path, '/'));
            $mime = Storage::disk('public')->mimeType($path);
            $size = Storage::disk('public')->size($path);
            $lastModified = Storage::disk('public')->lastModified($path);

            return [
                'path' => $path,
                'url' => $url,
                'filename' => basename($path),
                'mime' => $mime,
                'size' => $size,
                'size_formatted' => $this->formatBytes($size),
                'type' => (str_starts_with($mime, 'image/') ? 'image'
                    : (str_starts_with($mime, 'video/') ? 'video'
                    : 'file')),
                'last_modified' => date('Y-m-d H:i:s', $lastModified),
            ];
        })->sortByDesc('last_modified')->values();

        $origin = $request->header('Origin', '*');

        return response()->json($files)
            ->header('Access-Control-Allow-Origin', $origin)
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
            ->header('Access-Control-Allow-Credentials', 'true');
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,webp,svg,mp4,gif|max:20480',
        ]);

        $file = $request->file('file');
        $mime = $file->getClientMimeType();
        $isImage = str_starts_with($mime, 'image/');

        if ($isImage && $mime !== 'image/svg+xml') {
            // Optimize image: resize to max 1920x1920, convert to WebP, compress to 80% quality
            $manager = new ImageManager(new Driver);
            $image = $manager->read($file);
            $image->scaleDown(width: 1920, height: 1920);
            $encoded = $image->toWebp(80);
            $encodedString = (string) $encoded;

            $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME).'_'.uniqid().'.webp';
            $path = 'uploads/'.$filename;
            Storage::disk('public')->put($path, $encodedString);

            return response()->json([
                'url' => url('/api/storage/'.ltrim($path, '/')),
                'path' => $path,
                'filename' => $filename,
                'size' => strlen($encodedString),
                'mime' => 'image/webp',
            ], 201);
        }

        // For non-images (videos, SVGs, etc.), store as-is
        $path = $file->store('uploads', 'public');

        return response()->json([
            'url' => url('/api/storage/'.ltrim($path, '/')),
            'path' => $path,
            'filename' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime' => $mime,
        ], 201);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        if (Storage::disk('public')->exists($request->path)) {
            Storage::disk('public')->delete($request->path);

            return response()->json(['message' => 'File deleted'], 200);
        }

        return response()->json(['message' => 'File not found'], 404);
    }

    public function serve(string $path)
    {
        if (! Storage::disk('public')->exists($path)) {
            abort(404);
        }

        $file = Storage::disk('public')->get($path);
        $mime = Storage::disk('public')->mimeType($path);

        return response($file, 200)
            ->header('Content-Type', $mime)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    }

    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, $precision).' '.$units[$pow];
    }
}
