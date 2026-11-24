<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Validation\ValidationException;
use Okjt\Kit\Content\PagePhotos;
use Okjt\Kit\Media\MediaAsset;
use Okjt\Kit\Support\ApiResponse;

/**
 * The page photos API, lifted from Naoa (SitePhotosController), for
 * @okjt/dashboard's AdminPagePhotos. Uploads go through the media library
 * (MediaController), which won't delete a file a place still shows.
 *
 *   Route::get('/page-photos', [PagePhotoController::class, 'index'])->middleware('throttle:60,1');
 *   Route::middleware([...admin...])->group(function () {
 *       Route::put('/admin/page-photos/{key}', [PagePhotoController::class, 'update']);
 *       Route::delete('/admin/page-photos/{key}', [PagePhotoController::class, 'reset']);
 *   });
 *
 * Each change goes in the console audit log, with the pictures before and
 * after.
 */
class PagePhotoController extends Controller
{
    use ApiResponse;

    /** Every swapped place and the library files it uses. Cached for a minute by browsers. */
    public function index(): JsonResponse
    {
        $data = PagePhotos::forPages();

        return $this->successResponse(['placements' => (object) $data['placements'], 'media' => (object) $data['media']])
            ->header('Cache-Control', 'public, max-age=60');
    }

    /** Choose a place's pictures: images: [ref, …] in order. */
    public function update(Request $request, string $key): JsonResponse
    {
        abort_unless(preg_match(PagePhotos::KEY, $key), 404);
        $validated = $request->validate([
            'images' => ['required', 'array', 'min:1', 'max:'.(int) config('okjt.page_photos.max', 8)],
            'images.*' => ['required', 'string', 'distinct', 'regex:'.PagePhotos::KEY],
        ]);
        $missing = collect($validated['images'])->map(fn ($ref) => PagePhotos::mediaId($ref))->filter()
            ->reject(fn ($id) => MediaAsset::whereKey($id)->exists());
        if ($missing->isNotEmpty()) {
            throw ValidationException::withMessages(['images' => 'That picture is no longer in the media library.']);
        }

        $before = PagePhotos::placements()[$key] ?? null;
        $images = PagePhotos::set($key, $validated['images'], $request->user()?->getKey());
        config('okjt.console.audit_model')::recordAbout('page_photo.changed', 'page', $key, ['before' => $before, 'after' => $images]);

        return $this->successResponse(['key' => $key, 'images' => $images], 'Picture changed');
    }

    /** Put a place back to its default picture. */
    public function reset(string $key): JsonResponse
    {
        abort_unless(preg_match(PagePhotos::KEY, $key), 404);
        $before = PagePhotos::reset($key);
        if ($before !== null) {
            config('okjt.console.audit_model')::recordAbout('page_photo.reset', 'page', $key, ['before' => $before]);
        }

        return $this->successResponse(['key' => $key, 'images' => null], 'Back to the original picture');
    }
}
