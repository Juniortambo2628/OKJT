<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Tags\HasTags;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Laravel\Scout\Searchable;

class PortfolioProject extends Model implements HasMedia
{
    use HasFactory, LogsActivity, HasTags, InteractsWithMedia, Searchable;

    protected $fillable = [
        'title',
        'description',
        'category',
        'client_name',
        'client_logo',
        'image_url',
        'project_url',
        'status',
        'featured',
        'sort_order',
    ];

    protected $casts = [
        'featured' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category,
            'client_name' => $this->client_name,
            'status' => $this->status,
            'featured' => (bool) $this->featured,
        ];
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('created_at', 'desc');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->useDisk('public')
            ->withResponsiveImages();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'description', 'category', 'status', 'featured', 'sort_order'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

