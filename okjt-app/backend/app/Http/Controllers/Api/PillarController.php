<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PillarResource;
use App\Models\Pillar;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class PillarController extends Controller
{
    use \App\Traits\HasUniqueSlug;

    private function clearCache()
    {
        Cache::forget('all_pillars');
    }

    public function index()
    {
        $pillars = Cache::rememberForever('all_pillars', function () {
            return Pillar::with('services')->get();
        });
        return PillarResource::collection($pillars);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'overview' => 'nullable|string',
            'content' => 'nullable|string',
            'icon' => 'nullable|string',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = $this->generateUniqueSlug($validated['title']);

        $pillar = Pillar::create($validated);
        $this->clearCache();
        return new PillarResource($pillar);
    }

    public function show($slug)
    {
        $pillar = Pillar::with('services')->where('slug', $slug)->firstOrFail();
        return new PillarResource($pillar);
    }

    public function update(Request $request, Pillar $pillar)
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'overview' => 'nullable|string',
            'content' => 'nullable|string',
            'icon' => 'nullable|string',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $pillar->title) {
            $validated['slug'] = $this->generateUniqueSlug($validated['title'], $pillar->id);
        }

        $pillar->update($validated);
        $this->clearCache();
        return new PillarResource($pillar);
    }

    public function destroy(Pillar $pillar)
    {
        $pillar->delete();
        $this->clearCache();
        return response()->json(null, 204);
    }
}
