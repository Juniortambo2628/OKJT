<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait HasUniqueSlug
{
    /**
     * Generate a unique slug for the model.
     */
    public function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $count = 1;

        while ($this->slugExists($slug, $excludeId)) {
            $slug = $originalSlug.'-'.$count++;
        }

        return $slug;
    }

    /**
     * Check if slug already exists.
     */
    protected function slugExists(string $slug, ?int $excludeId = null): bool
    {
        $modelClass = $this->getModelClass();
        $query = $modelClass::where('slug', $slug);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}
