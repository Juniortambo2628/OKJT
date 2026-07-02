<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use SoftDeletes;
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

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function pillar()
    {
        return $this->belongsTo(Pillar::class);
    }
}
