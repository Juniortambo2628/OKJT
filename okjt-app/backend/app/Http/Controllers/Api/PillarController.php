<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PillarResource;
use App\Traits\HandlesStandardCrud;
use App\Traits\HasUniqueSlug;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class PillarController extends Controller
{
    use HandlesStandardCrud, HasUniqueSlug;

    protected $withRelations = ['services'];

    protected $resourceClass = PillarResource::class;

    protected function getCacheKey(): ?string
    {
        return request()->user('sanctum') ? 'all_pillars_admin' : 'all_pillars';
    }

    protected function clearCache(): void
    {
        \Illuminate\Support\Facades\Cache::forget('all_pillars');
        \Illuminate\Support\Facades\Cache::forget('all_pillars_admin');
    }

    protected function indexQuery(Builder $query): Builder
    {
        if (! request()->user('sanctum')) {
            $query->where('is_active', true);
        }

        return $query->orderBy('created_at', 'desc');
    }

    protected function storeRules(Request $request): array
    {
        return [
            'title' => 'required|string|max:255',
            'overview' => 'nullable|string',
            'content' => 'nullable|string',
            'icon' => 'nullable|string',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }

    protected function updateRules(Request $request, $record): array
    {
        return [
            'title' => 'string|max:255',
            'overview' => 'nullable|string',
            'content' => 'nullable|string',
            'icon' => 'nullable|string',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
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

    protected function resolveRouteBinding($value, $field = null)
    {
        $field = $field ?? 'slug';

        return parent::resolveRouteBinding($value, $field);
    }
}
