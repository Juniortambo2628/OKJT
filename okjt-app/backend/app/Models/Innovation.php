<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Innovation extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'tagline',
        'description',
        'image',
        'url',
        'category',
        'technologies',
        'significant_figure',
        'problem',
        'methodology',
        'outcome',
        'testimonial_quote',
        'testimonial_author',
        'gallery',
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
}
