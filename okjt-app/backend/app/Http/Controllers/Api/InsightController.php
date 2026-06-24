<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InsightResource;
use App\Models\Insight;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class InsightController extends Controller
{
    use \App\Traits\HasUniqueSlug;

    private function clearCache()
    {
        Cache::forget('published_insights');
    }

    public function index()
    {
        $insights = Cache::rememberForever('published_insights', function () {
            return Insight::with('user')
                ->where('is_published', true)
                ->orderBy('published_at', 'desc')
                ->get();
        });
            
        return InsightResource::collection($insights);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'nullable|string',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'image' => 'nullable|string',
            'is_published' => 'boolean',
        ]);

        $validated['slug'] = $this->generateUniqueSlug($validated['title']);
        $validated['user_id'] = $request->user()->id;
        
        if ($validated['is_published'] ?? false) {
            $validated['published_at'] = now();
        }

        $insight = Insight::create($validated);
        $this->clearCache();
        return new InsightResource($insight);
    }

    public function show(Insight $insight)
    {
        return new InsightResource($insight->load('user'));
    }

    public function update(Request $request, Insight $insight)
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'category' => 'nullable|string',
            'excerpt' => 'nullable|string',
            'content' => 'string',
            'image' => 'nullable|string',
            'is_published' => 'boolean',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $insight->title) {
            $validated['slug'] = $this->generateUniqueSlug($validated['title'], $insight->id);
        }

        if (($validated['is_published'] ?? false) && !$insight->is_published) {
            $validated['published_at'] = now();
        }

        $insight->update($validated);
        $this->clearCache();
        return new InsightResource($insight->load('user'));
    }

    public function destroy(Insight $insight)
    {
        $insight->delete();
        $this->clearCache();
        return response()->json(null, 204);
    }
}

