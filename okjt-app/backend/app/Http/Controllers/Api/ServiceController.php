<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\Request;
use App\Traits\HandlesStandardCrud;
use App\Traits\HasUniqueSlug;

class ServiceController extends Controller
{
    use HandlesStandardCrud, HasUniqueSlug;

    protected $withRelations = ['pillar'];
    protected $cacheKey = 'all_services';
    protected $resourceClass = ServiceResource::class;

    protected function storeRules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'category' => 'required|string',
            'description' => 'required|string',
            'content' => 'nullable|string',
            'icon' => 'nullable|string',
            'image' => 'nullable|string',
            'pillar_id' => 'nullable|exists:pillars,id',
        ];
    }

    protected function updateRules(Request $request, $record): array
    {
        return [
            'title' => 'string|max:255',
            'category' => 'string',
            'description' => 'string',
            'content' => 'nullable|string',
            'icon' => 'nullable|string',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
            'pillar_id' => 'nullable|exists:pillars,id',
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

    public function show(Service $service)
    {
        return new ServiceResource($service->load('pillar'));
    }
}
