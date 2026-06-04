<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pillar extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'overview',
        'content',
        'icon',
        'image',
        'is_active',
    ];

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }
}
