<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;
use App\Traits\HandlesStandardCrud;
use App\Traits\HasUniqueSlug;

class ProjectController extends Controller
{
    use HandlesStandardCrud, HasUniqueSlug;

    protected $resourceClass = ProjectResource::class;

    protected function getCacheKey(): ?string
    {
        return request()->get('type') ? 'projects_' . request()->get('type') : 'projects_all';
    }

    protected function clearCache(): void
    {
        \Illuminate\Support\Facades\Cache::forget('projects_all');
        \Illuminate\Support\Facades\Cache::forget('projects_client');
        \Illuminate\Support\Facades\Cache::forget('projects_flagship');
    }

    protected function indexQuery($query)
    {
        $type = request()->get('type');
        if ($type) {
            $query->where('type', $type);
        }
        return $query->orderBy('order')->orderBy('created_at', 'desc');
    }

    protected function storeRules(): array
    {
        return [
            'type' => 'required|string|in:client,flagship',
            'title' => 'required|string|max:255',
            'client_name' => 'nullable|string',
            'tagline' => 'nullable|string|max:255',
            'category' => 'nullable|string',
            'technologies' => 'nullable|array',
            'description' => 'nullable|string',
            'significant_figure' => 'nullable|string',
            'problem' => 'nullable|string',
            'methodology' => 'nullable|string',
            'outcome' => 'nullable|string',
            'testimonial_quote' => 'nullable|string',
            'testimonial_author' => 'nullable|string',
            'image' => 'nullable|string',
            'gallery' => 'nullable|array',
            'url' => 'nullable|string',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'order' => 'integer',
        ];
    }

    protected function updateRules(Request $request, $record): array
    {
        return [
            'type' => 'string|in:client,flagship',
            'title' => 'string|max:255',
            'client_name' => 'nullable|string',
            'tagline' => 'nullable|string|max:255',
            'category' => 'nullable|string',
            'technologies' => 'nullable|array',
            'description' => 'nullable|string',
            'significant_figure' => 'nullable|string',
            'problem' => 'nullable|string',
            'methodology' => 'nullable|string',
            'outcome' => 'nullable|string',
            'testimonial_quote' => 'nullable|string',
            'testimonial_author' => 'nullable|string',
            'image' => 'nullable|string',
            'gallery' => 'nullable|array',
            'url' => 'nullable|string',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'order' => 'integer',
        ];
    }

    protected function beforeStore(array $validated, Request $request): array
    {
        $validated['slug'] = $this->generateUniqueSlug($validated['title']);
        return $validated;
    }

    protected function beforeUpdate($record, array $validated, Request $request): array
    {
        if (isset($validated['title']) && $validated['title'] !== $record->title) {
            $validated['slug'] = $this->generateUniqueSlug($validated['title'], $record->id);
        }
        return $validated;
    }
}
