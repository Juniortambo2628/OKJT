<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProjectController extends Controller
{
    use \App\Traits\HasUniqueSlug;

    private function clearCache()
    {
        Cache::forget('projects_all');
        Cache::forget('projects_client');
        Cache::forget('projects_flagship');
    }

    public function index(Request $request)
    {
        $type = $request->get('type');
        $cacheKey = $type ? 'projects_' . $type : 'projects_all';

        $projects = Cache::rememberForever($cacheKey, function () use ($type) {
            $query = Project::query();
            if ($type) {
                $query->where('type', $type);
            }
            return $query->orderBy('order')->orderBy('created_at', 'desc')->get();
        });

        return ProjectResource::collection($projects);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
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
            'website_url' => 'nullable|string',
            'url' => 'nullable|string',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'order' => 'integer',
        ]);

        $validated['slug'] = $this->generateUniqueSlug($validated['title']);
        $project = Project::create($validated);
        $this->clearCache();
        return new ProjectResource($project);
    }

    public function show($identifier)
    {
        $project = Project::where('id', $identifier)
            ->orWhere('slug', $identifier)
            ->firstOrFail();

        return new ProjectResource($project);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
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
            'website_url' => 'nullable|string',
            'url' => 'nullable|string',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'order' => 'integer',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $project->title) {
            $validated['slug'] = $this->generateUniqueSlug($validated['title'], $project->id);
        }

        $project->update($validated);
        $this->clearCache();
        return new ProjectResource($project);
    }

    public function destroy(Project $project)
    {
        $project->delete();
        $this->clearCache();
        return response()->json(null, 204);
    }
}
