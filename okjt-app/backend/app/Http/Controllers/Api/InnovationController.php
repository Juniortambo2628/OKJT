<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Innovation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InnovationController extends Controller
{
    public function index()
    {
        return Innovation::orderBy('order')->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'url' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'technologies' => 'nullable|array',
            'significant_figure' => 'nullable|string|max:255',
            'problem' => 'nullable|string',
            'methodology' => 'nullable|string',
            'outcome' => 'nullable|string',
            'testimonial_quote' => 'nullable|string',
            'testimonial_author' => 'nullable|string|max:255',
            'gallery' => 'nullable|array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'order' => 'integer',
        ]);

        $slug = Str::slug($validated['title']);
        $originalSlug = $slug;
        $count = 1;
        while (Innovation::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }
        $validated['slug'] = $slug;

        $innovation = Innovation::create($validated);
        return response()->json($innovation, 201);
    }

    public function show($identifier)
    {
        $innovation = Innovation::where('id', $identifier)
            ->orWhere('slug', $identifier)
            ->firstOrFail();
            
        return response()->json($innovation);
    }

    public function update(Request $request, Innovation $innovation)
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'tagline' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'url' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'technologies' => 'nullable|array',
            'significant_figure' => 'nullable|string|max:255',
            'problem' => 'nullable|string',
            'methodology' => 'nullable|string',
            'outcome' => 'nullable|string',
            'testimonial_quote' => 'nullable|string',
            'testimonial_author' => 'nullable|string|max:255',
            'gallery' => 'nullable|array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'order' => 'integer',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $innovation->title) {
            $slug = Str::slug($validated['title']);
            $originalSlug = $slug;
            $count = 1;
            while (Innovation::where('slug', $slug)->where('id', '!=', $innovation->id)->exists()) {
                $slug = $originalSlug . '-' . $count++;
            }
            $validated['slug'] = $slug;
        }

        $innovation->update($validated);
        return response()->json($innovation);
    }

    public function destroy(Innovation $innovation)
    {
        $innovation->delete();
        return response()->json(null, 204);
    }
}
