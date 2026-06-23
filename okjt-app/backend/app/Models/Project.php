<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'title',
        'slug',
        'client_name',
        'tagline',
        'category',
        'technologies',
        'significant_figure',
        'description',
        'problem',
        'methodology',
        'outcome',
        'testimonial_quote',
        'testimonial_author',
        'image',
        'gallery',
        'website_url',
        'url',
        'is_active',
        'is_featured',
        'order',
    ];

    protected $casts = [
        'technologies' => 'array',
        'gallery' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function scopeClient($query)
    {
        return $query->where('type', 'client');
    }

    public function scopeFlagship($query)
    {
        return $query->where('type', 'flagship');
    }
}
