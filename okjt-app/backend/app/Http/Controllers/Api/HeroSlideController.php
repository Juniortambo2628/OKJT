<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HeroSlideController extends Controller
{
    public function publicIndex(): JsonResponse
    {
        $slides = HeroSlide::ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $slides,
        ]);
    }

    public function index(): JsonResponse
    {
        $slides = HeroSlide::ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $slides,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'label' => 'required|string|max:50',
            'text' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'testimonial_text' => 'nullable|string|max:500',
            'testimonial_author' => 'nullable|string|max:100',
            'testimonial_company' => 'nullable|string|max:100',
            'overlay_opacity' => 'nullable|numeric|min:0|max:1',
            'sort_order' => 'nullable|integer',
        ]);

        $slide = HeroSlide::create([
            'label' => $validated['label'],
            'text' => $validated['text'],
            'subtitle' => $validated['subtitle'] ?? null,
            'testimonial_text' => $validated['testimonial_text'] ?? null,
            'testimonial_author' => $validated['testimonial_author'] ?? null,
            'testimonial_company' => $validated['testimonial_company'] ?? null,
            'overlay_opacity' => $validated['overlay_opacity'] ?? 0.4,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'data' => $slide,
            'message' => 'Hero slide created successfully',
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $slide = HeroSlide::find($id);

        if (! $slide) {
            return response()->json([
                'success' => false,
                'message' => 'Slide not found',
            ], 404);
        }

        $validated = $request->validate([
            'label' => 'sometimes|required|string|max:50',
            'text' => 'sometimes|required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'testimonial_text' => 'nullable|string|max:500',
            'testimonial_author' => 'nullable|string|max:100',
            'testimonial_company' => 'nullable|string|max:100',
            'overlay_opacity' => 'nullable|numeric|min:0|max:1',
            'sort_order' => 'nullable|integer',
        ]);

        $slide->update($validated);

        return response()->json([
            'success' => true,
            'data' => $slide,
            'message' => 'Hero slide updated successfully',
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $slide = HeroSlide::find($id);

        if (! $slide) {
            return response()->json([
                'success' => false,
                'message' => 'Slide not found',
            ], 404);
        }

        $slide->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hero slide deleted successfully',
        ]);
    }

    public function uploadBackground(Request $request, int $id): JsonResponse
    {
        $slide = HeroSlide::find($id);

        if (! $slide) {
            return response()->json([
                'success' => false,
                'message' => 'Slide not found',
            ], 404);
        }

        $request->validate([
            'image' => 'required|image|max:20480', // 20MB
        ]);

        $media = $slide->addMediaFromRequest('image')->toMediaCollection('background');

        $slide->update(['image_url' => $media->getUrl()]);

        return response()->json([
            'success' => true,
            'data' => $slide->fresh(),
            'message' => 'Background image updated',
        ]);
    }
}


