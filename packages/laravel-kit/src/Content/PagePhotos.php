<?php

namespace Okjt\Kit\Content;

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Okjt\Kit\Media\MediaAsset;
use Okjt\Kit\Workspace\CurrentWorkspace;

/**
 * Page photos: which pictures a place on the site shows ("homeHero",
 * "tradition-luo"…). Lifted from Naoa (SitePhotosController,
 * SitePhotoPlacement). Each place keeps its default picture in the
 * project's frontend; the admin can swap in other pictures, several of
 * which cross-fade in order (at most okjt.page_photos.max).
 *
 * A picture is a ref: "media-{id}" for one in the media library, or any
 * other short key the project's frontend knows (a built-in photo,
 * "couple-2"). The kit checks media refs exist; built-in keys are the
 * frontend's.
 */
final class PagePhotos
{
    public const TABLE = 'okjt_page_photos';

    public const KEY = '/^[A-Za-z0-9_-]{1,64}$/';

    /** key => [refs], for every place someone swapped. */
    public static function placements(): array
    {
        try {
            return self::query()->get(['key', 'images'])->mapWithKeys(fn ($row) => [$row->key => (array) json_decode($row->images, true)])->all();
        } catch (QueryException) {
            return [];
        }
    }

    /** What the pages need: placements, and the library files they use by ref. */
    public static function forPages(): array
    {
        $placements = self::placements();
        $ids = collect($placements)->flatten()->map(fn ($ref) => self::mediaId($ref))->filter()->unique()->values();
        $media = $ids->isEmpty() ? [] : MediaAsset::whereIn('id', $ids)->get()
            ->mapWithKeys(fn (MediaAsset $m) => ['media-'.$m->id => $m->present()])->all();

        return ['placements' => $placements, 'media' => $media];
    }

    /** Set a place's pictures (refs, in order). Returns them. */
    public static function set(string $key, array $images, ?int $userId = null): array
    {
        $images = array_values($images);
        $values = ['images' => json_encode($images), 'updated_by' => $userId, 'updated_at' => now()];
        if (self::query()->where('key', $key)->exists()) {
            self::query()->where('key', $key)->update($values);
        } else {
            DB::table(self::TABLE)->insert(['workspace_id' => self::workspaceId(), 'key' => $key, 'created_at' => now()] + $values);
        }

        return $images;
    }

    /** Put a place back to its default picture. Returns the refs it had. */
    public static function reset(string $key): ?array
    {
        $before = self::placements()[$key] ?? null;
        self::query()->where('key', $key)->delete();

        return $before;
    }

    /** The places that show a library file (any workspace's, so a shared file isn't deleted from under one). */
    public static function placesUsing(int $mediaId): array
    {
        try {
            return DB::table(self::TABLE)->get(['key', 'images'])
                ->filter(fn ($row) => in_array('media-'.$mediaId, (array) json_decode($row->images, true), true))
                ->pluck('key')->unique()->values()->all();
        } catch (QueryException) {
            return [];
        }
    }

    public static function mediaId(string $ref): ?int
    {
        return preg_match('/^media-(\d+)$/', $ref, $m) ? (int) $m[1] : null;
    }

    private static function workspaceId(): ?int
    {
        return config('okjt.page_photos.per_workspace') ? CurrentWorkspace::id() : null;
    }

    private static function query()
    {
        $id = self::workspaceId();

        return DB::table(self::TABLE)->when($id === null, fn ($q) => $q->whereNull('workspace_id'), fn ($q) => $q->where('workspace_id', $id));
    }
}
