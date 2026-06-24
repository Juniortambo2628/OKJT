<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class ServiceController extends Controller
{
    use \App\Traits\HasUniqueSlug;

    private function clearCache()
    {
        Cache::forget('all_services');
    }

    public function index()
    {
        $services = Cache::rememberForever('all_services', function () {
            return Service::with('pillar')->orderBy('created_at', 'desc')->get();
        });
        return ServiceResource::collection($services);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string',
            'description' => 'required|string',
            'content' => 'nullable|string',
            'icon' => 'nullable|string',
            'image' => 'nullable|string',
            'pillar_id' => 'nullable|exists:pillars,id',
        ]);

        $validated['slug'] = $this->generateUniqueSlug($validated['title']);
        $service = Service::create($validated);
        $this->clearCache();
        return new ServiceResource($service);
    }

    public function show(Service $service)
    {
        return new ServiceResource($service);
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'category' => 'string',
            'description' => 'string',
            'content' => 'nullable|string',
            'icon' => 'nullable|string',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
            'pillar_id' => 'nullable|exists:pillars,id',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $service->title) {
            $validated['slug'] = $this->generateUniqueSlug($validated['title'], $service->id);
        }

        $service->update($validated);
        $this->clearCache();
        return new ServiceResource($service);
    }

    public function destroy(Service $service)
    {
        $service->delete();
        $this->clearCache();
        return response()->json(null, 204);
    }
}

