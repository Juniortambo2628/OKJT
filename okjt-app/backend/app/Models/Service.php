<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'pillar_id',
        'title',
        'slug',
        'category',
        'description',
        'content',
        'icon',
        'image',
        'is_active',
    ];

    public function pillar()
    {
        return $this->belongsTo(Pillar::class);
    }
}
