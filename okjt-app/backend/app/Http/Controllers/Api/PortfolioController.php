<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PortfolioProject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class PortfolioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PortfolioProject::ordered();

        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        if ($request->has('featured') && $request->featured) {
            $query->featured();
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by tags if provided
        if ($request->has('tags') && is_array($request->tags) && count($request->tags) > 0) {
            $query->withAnyTags($request->tags);
        }

        $projects = $query->with('tags')->get();

        return response()->json([
            'success' => true,
            'data' => $projects,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $project = PortfolioProject::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found',
            ], 404);
        }

        // Load tags relationship
        $project->load('tags');

        return response()->json([
            'success' => true,
            'data' => $project,
        ]);
    }

    public function categories(): JsonResponse
    {
        $categories = PortfolioProject::distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function featured(Request $request): JsonResponse
    {
        $query = PortfolioProject::featured()->ordered();

        if ($request->has('limit')) {
            $query->limit($request->limit);
        }

        $projects = $query->get();

        return response()->json([
            'success' => true,
            'data' => $projects,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:100',
            'client_name' => 'nullable|string|max:255',
            'client_logo' => 'nullable|string|url',
            'image_url' => 'nullable|string|url', // Made nullable
            'project_url' => 'nullable|string|url',
            'status' => 'in:completed,in_progress,pending',
            'featured' => 'boolean',
            'sort_order' => 'integer',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'image' => 'nullable|image|max:10240', // 10MB max
        ]);

        // Remove image from validated data as it's handled separately
        $projectData = collect($validated)->except(['image', 'tags'])->toArray();
        
        // Ensure boolean casting
        $projectData['featured'] = filter_var($request->featured, FILTER_VALIDATE_BOOLEAN);

        $project = PortfolioProject::create($projectData);
        
        // Handle Image Upload
        if ($request->hasFile('image')) {
            $media = $project->addMediaFromRequest('image')->toMediaCollection('images');
            $project->update(['image_url' => $media->getUrl()]);
        }
        
        // Attach tags if provided
        if ($request->has('tags') && is_array($request->tags) && count($request->tags) > 0) {
            $project->syncTags(collect($request->tags)->map(fn($tag) => ['name' => $tag])->toArray());
        }

        return response()->json([
            'success' => true,
            'data' => $project,
            'message' => 'Project created successfully',
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $project = PortfolioProject::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found',
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'string',
            'category' => 'string|max:100',
            'client_name' => 'nullable|string|max:255',
            'client_logo' => 'nullable|string|url',
            'image_url' => 'nullable|string|url',
            'project_url' => 'nullable|string|url',
            'status' => 'in:completed,in_progress,pending',
            'featured' => 'boolean',
            'sort_order' => 'integer',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $project->update($validated);
        
        // Sync tags if provided
        if ($request->has('tags') && is_array($request->tags)) {
            if (count($request->tags) > 0) {
                $project->syncTags(collect($request->tags)->map(fn($tag) => ['name' => $tag])->toArray());
            } else {
                $project->syncTags([]);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $project,
            'message' => 'Project updated successfully',
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $project = PortfolioProject::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found',
            ], 404);
        }

        $project->delete();

        return response()->json([
            'success' => true,
            'message' => 'Project deleted successfully',
        ]);
    }

    /**
     * Toggle featured status
     */
    public function toggleFeatured(int $id): JsonResponse
    {
        $project = PortfolioProject::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found',
            ], 404);
        }

        $project->update(['featured' => !$project->featured]);

        return response()->json([
            'success' => true,
            'data' => $project,
            'message' => 'Project featured status updated',
        ]);
    }

    /**
     * Reorder projects
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:portfolio_projects,id',
        ]);

        foreach ($validated['ids'] as $order => $id) {
            PortfolioProject::where('id', $id)->update(['sort_order' => $order]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Projects reordered successfully',
        ]);
    }

    /**
     * Get all tags used in portfolio
     */
    public function getAllTags(): JsonResponse
    {
        $tags = \Spatie\Tags\Tag::whereHas('taggables', function ($query) {
            $query->where('taggable_type', PortfolioProject::class);
        })->get()->map(function ($tag) {
            return is_array($tag->name) ? ($tag->name['en'] ?? $tag->name[array_key_first($tag->name)] ?? '') : $tag->name;
        })->filter()->unique()->values()->toArray();

        return response()->json([
            'success' => true,
            'data' => $tags,
        ]);
    }

    /**
     * Get media (image gallery) for a project
     */
    public function media(int $id): JsonResponse
    {
        $project = PortfolioProject::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found',
            ], 404);
        }

        $mediaItems = $project->getMedia('images')->map(function ($media) use ($project) {
            return [
                'id' => $media->id,
                'file_name' => $media->file_name,
                'url' => $media->getUrl(),
                'thumb_url' => $media->hasGeneratedConversion('thumb') ? $media->getUrl('thumb') : $media->getUrl(),
                'is_primary' => $project->image_url === $media->getUrl(),
                'size' => $media->size,
                'created_at' => $media->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $mediaItems,
        ]);
    }

    /**
     * Upload a new image to the project's gallery
     */
    public function uploadMedia(Request $request, int $id): JsonResponse
    {
        $project = PortfolioProject::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found',
            ], 404);
        }

        $validated = $request->validate([
            'image' => 'required|image|max:5120', // 5MB
        ]);

        $media = $project
            ->addMediaFromRequest('image')
            ->toMediaCollection('images');

        // If project has no primary image yet, set this one
        if (empty($project->image_url)) {
            $project->update(['image_url' => $media->getUrl()]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $media->id,
                'file_name' => $media->file_name,
                'url' => $media->getUrl(),
                'thumb_url' => $media->getUrl(),
                'is_primary' => $project->image_url === $media->getUrl(),
                'size' => $media->size,
                'created_at' => $media->created_at,
            ],
            'message' => 'Image uploaded successfully',
        ], 201);
    }

    /**
     * Delete an image from the project's gallery
     */
    public function deleteMedia(int $id, int $mediaId): JsonResponse
    {
        $project = PortfolioProject::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found',
            ], 404);
        }

        $media = $project->media()->where('id', $mediaId)->first();

        if (!$media) {
            return response()->json([
                'success' => false,
                'message' => 'Image not found',
            ], 404);
        }

        $wasPrimary = $project->image_url === $media->getUrl();

        $media->delete();

        // If primary image was deleted, reset to another image (if available)
        if ($wasPrimary) {
            $newPrimary = $project->getFirstMediaUrl('images');
            $project->update(['image_url' => $newPrimary ?: null]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Image deleted successfully',
        ]);
    }

    /**
     * Set primary image for project (also updates image_url)
     */
    public function setPrimaryImage(int $id, int $mediaId): JsonResponse
    {
        $project = PortfolioProject::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found',
            ], 404);
        }

        $media = $project->media()->where('id', $mediaId)->first();

        if (!$media) {
            return response()->json([
                'success' => false,
                'message' => 'Image not found',
            ], 404);
        }

        $project->update(['image_url' => $media->getUrl()]);

        return response()->json([
            'success' => true,
            'message' => 'Primary image updated',
        ]);
    }
}

