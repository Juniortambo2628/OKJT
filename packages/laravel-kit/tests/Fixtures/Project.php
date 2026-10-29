<?php

namespace Okjt\Kit\Tests\Fixtures;

use Illuminate\Database\Eloquent\Model;
use Okjt\Kit\Workspace\Workspace;

class Project extends Model implements Workspace
{
    protected $guarded = [];

    public static function findByKey(?string $key): ?self
    {
        return $key ? static::where('slug', $key)->first() : null;
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isPublished(): bool
    {
        return (bool) $this->published;
    }
}
