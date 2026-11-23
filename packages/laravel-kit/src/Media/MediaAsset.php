<?php

namespace Okjt\Kit\Media;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One stored upload in the media library. Lifted from TFE's App\Models\MediaAsset. */
class MediaAsset extends Model
{
    protected $fillable = ['disk', 'path', 'url', 'name', 'mime', 'kind', 'size', 'width', 'height', 'uploaded_by'];

    protected $casts = ['size' => 'integer', 'width' => 'integer', 'height' => 'integer'];

    public function getTable(): string
    {
        return config('okjt.media.table', 'media_assets');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(config('okjt.user_model'), 'uploaded_by');
    }

    /** What the API and the picker show. */
    public function present(): array
    {
        return [
            'id' => $this->id,
            'url' => $this->url,
            'name' => $this->name,
            'kind' => $this->kind,
            'mime' => $this->mime,
            'size' => $this->size,
            'width' => $this->width,
            'height' => $this->height,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
