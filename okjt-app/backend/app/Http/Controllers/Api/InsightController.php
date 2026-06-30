<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InsightResource;
use App\Models\Insight;
use Illuminate\Http\Request;
use App\Traits\HandlesStandardCrud;
use App\Traits\HasUniqueSlug;
use Illuminate\Database\Eloquent\Builder;

class InsightController extends Controller
{
    use HandlesStandardCrud, HasUniqueSlug;

    protected $withRelations = ['user'];
    protected $cacheKey = 'published_insights';
    protected $resourceClass = InsightResource::class;

    protected function indexQuery(Builder $query): Builder
    {
        return $query->where('is_published', true)->orderBy('published_at', 'desc');
    }

    protected function storeRules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'category' => 'nullable|string',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'image' => 'nullable|string',
            'is_published' => 'boolean',
        ];
    }

    protected function updateRules(Request $request, $record): array
    {
        return [
            'title' => 'string|max:255',
            'category' => 'nullable|string',
            'excerpt' => 'nullable|string',
            'content' => 'string',
            'image' => 'nullable|string',
            'is_published' => 'boolean',
        ];
    }

    protected function beforeStore(array $validated, Request $request): array
    {
        $validated['slug'] = $this->generateUniqueSlug($validated['title']);
        $validated['user_id'] = $request->user()->id;

        if ($validated['is_published'] ?? false) {
            $validated['published_at'] = now();
        }

        return $validated;
    }

    protected function beforeUpdate($record, array $validated, Request $request): array
    {
        if (isset($validated['title']) && $validated['title'] !== $record->title) {
            $validated['slug'] = $this->generateUniqueSlug($validated['title'], $record->id);
        }

        if (($validated['is_published'] ?? false) && !$record->is_published) {
            $validated['published_at'] = now();
        }

        return $validated;
    }

    protected function resolveRouteBinding($value, $field = null)
    {
        $field = $field ?? 'slug';
        return parent::resolveRouteBinding($value, $field);
    }

    public function show($slug)
    {
        return parent::show($slug);
    }
}
