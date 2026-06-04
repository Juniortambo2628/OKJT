<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CaseStudyResource;
use App\Models\CaseStudy;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CaseStudyController extends Controller
{
    use \App\Traits\HasUniqueSlug;

    public function index()
    {
        return CaseStudyResource::collection(CaseStudy::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'client_name' => 'nullable|string',
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
            'is_featured' => 'boolean',
        ]);

        $validated['slug'] = $this->generateUniqueSlug($validated['title']);
        $caseStudy = CaseStudy::create($validated);
        return new CaseStudyResource($caseStudy);
    }

    public function show(CaseStudy $caseStudy)
    {
        return new CaseStudyResource($caseStudy);
    }

    public function update(Request $request, CaseStudy $caseStudy)
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'client_name' => 'nullable|string',
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
            'is_featured' => 'boolean',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $caseStudy->title) {
            $validated['slug'] = $this->generateUniqueSlug($validated['title'], $caseStudy->id);
        }

        $caseStudy->update($validated);
        return new CaseStudyResource($caseStudy);
    }

    public function destroy(CaseStudy $caseStudy)
    {
        $caseStudy->delete();
        return response()->json(null, 204);
    }
}

