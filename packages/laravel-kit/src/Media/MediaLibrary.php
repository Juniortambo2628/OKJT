<?php

namespace Okjt\Kit\Media;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

/**
 * The one place uploads are stored, lifted from TFE
 * (App\Services\MediaLibraryService, Sprint 50).
 *
 * store() scales raster images down to okjt.media.max_edge (1920) and
 * re-encodes them at okjt.media.quality (82) before they land on disk, and
 * records every stored file as a MediaAsset, so the same photo can be picked
 * again from the library (MediaPicker) instead of uploaded twice. Animated
 * GIF and video are stored as they are. If optimising fails (GD without an
 * encoder, e.g. AVIF), the original bytes are stored: an upload never fails
 * over optimisation.
 *
 * Accepted types are declared here once (IMAGE_* / VIDEO_*) and given to
 * controllers as rules (imageRules / mediaRules) and to the browser as an
 * `accept` string; @okjt/ui's IMAGE_MIMES / VIDEO_MIMES mirror them. SVG is
 * excluded everywhere: on a same-origin storage URL an uploaded SVG is a
 * stored-XSS vector.
 */
class MediaLibrary
{
    public const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];

    public const VIDEO_EXTENSIONS = ['mp4', 'webm'];

    public const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

    public const VIDEO_MIMES = ['video/mp4', 'video/webm'];

    /** Formats re-encoded. Animated GIF is left as it is so it keeps moving. */
    private const OPTIMIZABLE = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

    /** Store an uploaded file (optimising images) and record it in the library. */
    public function store(UploadedFile $file, ?string $folder = null, ?int $userId = null): MediaAsset
    {
        $disk = config('okjt.media.disk', 'public');
        $folder ??= config('okjt.media.folder', 'assets/library');
        $maxEdge = (int) config('okjt.media.max_edge', 1920);
        $quality = (int) config('okjt.media.quality', 82);
        $userId ??= auth()->id();

        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'bin');
        $kind = in_array($extension, self::VIDEO_EXTENSIONS, true) ? 'video' : 'image';
        $path = $folder.'/'.uniqid('m_', true).'.'.$extension;
        [$width, $height] = [null, null];
        $stored = false;

        if ($kind === 'image' && in_array($extension, self::OPTIMIZABLE, true)) {
            try {
                $image = (new ImageManager(new Driver))->read($file->getRealPath());
                $image->scaleDown($maxEdge, $maxEdge);
                [$width, $height] = [$image->width(), $image->height()];
                Storage::disk($disk)->put($path, (string) $image->encodeByExtension($extension, quality: $quality));
                $stored = true;
            } catch (\Throwable $e) {
                Log::warning('Image optimisation failed, storing the original', ['ext' => $extension, 'error' => get_class($e)]);
                [$width, $height] = $this->dimensions($file);
            }
        }

        if (! $stored) {
            $path = $file->storeAs($folder, basename($path), $disk);
            if ($kind === 'image' && $width === null) {
                [$width, $height] = $this->dimensions($file);
            }
        }

        return MediaAsset::create([
            'disk' => $disk,
            'path' => $path,
            'url' => Storage::disk($disk)->url($path),
            'name' => $file->getClientOriginalName() ?: basename($path),
            'mime' => $file->getClientMimeType(),
            'kind' => $kind,
            'size' => Storage::disk($disk)->size($path),
            'width' => $width,
            'height' => $height,
            'uploaded_by' => $userId,
        ]);
    }

    /** Delete an asset's file and its library row. */
    public function delete(MediaAsset $asset): void
    {
        Storage::disk($asset->disk)->delete($asset->path);
        $asset->delete();
    }

    private function dimensions(UploadedFile $file): array
    {
        $info = @getimagesize($file->getRealPath());

        return [$info[0] ?? null, $info[1] ?? null];
    }

    /** Rules for an image-only field (a hero background). */
    public static function imageRules(int $maxKb = 12288, bool $required = true): array
    {
        return [$required ? 'required' : 'nullable', 'file', 'mimes:'.implode(',', self::IMAGE_EXTENSIONS), 'max:'.$maxKb];
    }

    /** Rules for a field that also takes video. */
    public static function mediaRules(int $maxKb = 51200, bool $required = true): array
    {
        return [$required ? 'required' : 'nullable', 'file', 'mimes:'.implode(',', array_merge(self::IMAGE_EXTENSIONS, self::VIDEO_EXTENSIONS)), 'max:'.$maxKb];
    }

    public static function imageAccept(): string
    {
        return implode(',', self::IMAGE_MIMES);
    }

    public static function mediaAccept(): string
    {
        return implode(',', array_merge(self::IMAGE_MIMES, self::VIDEO_MIMES));
    }
}
