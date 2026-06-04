<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CaseStudy extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'client_name',
        'category',
        'technologies',
        'description',
        'significant_figure',
        'problem',
        'methodology',
        'outcome',
        'testimonial_quote',
        'testimonial_author',
        'image',
        'gallery',
        'website_url',
        'is_featured',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'technologies' => 'array',
        'gallery' => 'array',
    ];
}
