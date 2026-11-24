<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Okjt\Kit\Media\MediaAsset;
use Okjt\Kit\Media\MediaLibrary;
use Okjt\Kit\Support\ApiResponse;

/**
 * The media library's API, for @okjt/dashboard's AdminMediaLibrary and
 * MediaPicker. Lifted from TFE (Admin\MediaController). Behind the project's
 * own admin middleware:
 *
 *   Route::middleware(['auth:sanctum', EnsureSuperadmin::class])->group(function () {
 *       Route::get('/media', [MediaController::class, 'index']);
 *       Route::post('/media', [MediaController::class, 'store']);
 *       Route::delete('/media/{id}', [MediaController::class, 'destroy']);
 *   });
 */
class MediaController extends Controller
{
    use ApiResponse;

    public function __construct(protected MediaLibrary $media) {}

    /** The newest assets (`kind=image` for a picker that must not offer video), and totals. */
    public function index(Request $request): JsonResponse
    {
        $query = MediaAsset::query()->latest()->latest('id');
        if (in_array($request->query('kind'), ['image', 'video'], true)) {
            $query->where('kind', $request->query('kind'));
        }

        return $this->successResponse([
            'assets' => $query->limit((int) config('okjt.media.list_limit', 200))->get()->map->present()->values(),
            'stats' => [
                'total' => MediaAsset::count(),
                'images' => MediaAsset::where('kind', 'image')->count(),
                'videos' => MediaAsset::where('kind', 'video')->count(),
                'bytes' => (int) MediaAsset::sum('size'),
            ],
        ]);
    }

    /** Upload one or more files. */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => MediaLibrary::mediaRules(),
        ], [
            'files.*.mimes' => 'Files must be an image (JPG, PNG, WebP, GIF, AVIF) or a video (MP4, WebM).',
        ]);

        $assets = collect($request->file('files', []))->map(fn ($file) => $this->media->store($file)->present())->values();

        return $this->createdResponse($assets, $assets->count() === 1 ? 'Uploaded' : "{$assets->count()} files uploaded");
    }

    /** Delete a file, unless a place on the site still shows it (page photos). */
    public function destroy(string $id): JsonResponse
    {
        $asset = MediaAsset::findOrFail($id);
        $usedIn = \Okjt\Kit\Content\PagePhotos::placesUsing($asset->id);
        if ($usedIn) {
            return $this->errorResponse('This picture is still on the site: '.implode(', ', $usedIn).'. Swap it out first.', 422);
        }
        $this->media->delete($asset);

        return $this->successResponse(null, 'Deleted');
    }
}
