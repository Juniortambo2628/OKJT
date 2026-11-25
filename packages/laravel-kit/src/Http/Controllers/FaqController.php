<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Validation\Rule;
use Okjt\Kit\Content\Faq;
use Okjt\Kit\Support\ApiResponse;

/**
 * The FAQ API, lifted from Naoa (FaqController + Reorderable), for
 * @okjt/dashboard's AdminFaqs. `?group=pricing` narrows to one page's list.
 *
 *   Route::get('/faqs', [FaqController::class, 'index']);
 *   Route::middleware([...admin...])->group(function () {
 *       Route::post('/faqs', [FaqController::class, 'store']);
 *       Route::put('/faqs/reorder', [FaqController::class, 'reorder']);
 *       Route::put('/faqs/{id}', [FaqController::class, 'update']);
 *       Route::delete('/faqs/{id}', [FaqController::class, 'destroy']);
 *   });
 *
 * Changes are in the version history (module 'faqs').
 */
class FaqController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        return $this->successResponse(
            Faq::query()->inGroup($request->query('group'))->orderBy('order')->orderBy('id')->get()->map->present()->values()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validated($request);
        $validated['order'] ??= (int) Faq::query()->inGroup($validated['group'] ?? null)->max('order') + 1;

        return $this->createdResponse(Faq::create($validated)->present(), 'Question added');
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $faq = Faq::findOrFail($id);
        $faq->update($this->validated($request));

        return $this->successResponse($faq->present(), 'Saved');
    }

    public function destroy(string $id): JsonResponse
    {
        Faq::findOrFail($id)->delete();

        return $this->successResponse(null, 'Question deleted');
    }

    /** New order: ids: [3, 1, 2] (this list's questions, first to last). */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|max:500',
            'ids.*' => ['required', 'integer', 'distinct'],
        ]);
        $faqs = Faq::query()->whereIn('id', $validated['ids'])->get()->keyBy('id');
        abort_if($faqs->count() !== count($validated['ids']), 422, 'Some of those questions no longer exist.');

        foreach ($validated['ids'] as $position => $id) {
            if ($faqs[$id]->order !== $position + 1) {
                $faqs[$id]->update(['order' => $position + 1]);
            }
        }

        return $this->successResponse(null, 'Order saved');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'question' => 'required|string|max:255',
            'answer' => 'required|string|max:20000',
            'order' => 'nullable|integer|min:0',
            'group' => ['nullable', 'string', 'max:60', 'regex:/^[a-z0-9_-]+$/i'],
        ]);
    }
}
