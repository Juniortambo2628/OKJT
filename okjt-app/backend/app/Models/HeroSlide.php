<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class HeroSlide extends Model implements HasMedia
{
    use HasFactory, LogsActivity, InteractsWithMedia;

    protected $fillable = [
        'label',
        'text',
        'subtitle',
        'testimonial_text',
        'testimonial_author',
        'testimonial_company',
        'overlay_opacity',
        'sort_order',
        'image_url',
    ];

    protected $casts = [
        'overlay_opacity' => 'float',
        'sort_order' => 'integer',
    ];

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('background')
            ->useDisk('public')
            ->withResponsiveImages();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['label', 'text', 'subtitle', 'overlay_opacity', 'sort_order', 'image_url'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}


