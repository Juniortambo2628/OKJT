<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use InvalidArgumentException;
use Okjt\Kit\Content\PageCopy;
use Okjt\Kit\Support\ApiResponse;

/**
 * The page copy API, for @okjt/dashboard's AdminPageCopy:
 *
 *   Route::get('/page-copy', [PageCopyController::class, 'publicIndex']);
 *   Route::middleware([...admin...])->group(function () {
 *       Route::get('/admin/page-copy', [PageCopyController::class, 'index']);
 *       Route::put('/admin/page-copy/{section}', [PageCopyController::class, 'update']);
 *       Route::delete('/admin/page-copy/{section}', [PageCopyController::class, 'reset']);
 *   });
 *
 * Each save and reset goes in the console audit log (the section, not the
 * words).
 */
class PageCopyController extends Controller
{
    use ApiResponse;

    /** The merged copy for the pages, hidden sections left out. */
    public function publicIndex(): JsonResponse
    {
        return $this->successResponse(PageCopy::all());
    }

    /** Every section with its editable text, defaults and saved values. */
    public function index(): JsonResponse
    {
        return $this->successResponse(PageCopy::editable());
    }

    /** Save a section: fields { path: text } and/or visible. */
    public function update(Request $request, string $section): JsonResponse
    {
        abort_unless(array_key_exists($section, PageCopy::defaults()), 404);
        $validated = $request->validate([
            'fields' => 'nullable|array|max:500',
            'fields.*' => 'nullable|string|max:20000',
            'visible' => 'nullable|boolean',
        ]);

        try {
            PageCopy::save($section, $validated['fields'] ?? [], $validated['visible'] ?? null, $request->user()?->getKey());
        } catch (InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
        config('okjt.console.audit_model')::recordAbout('page_copy.updated', 'page', $section, array_filter([
            'fields' => array_keys($validated['fields'] ?? []),
            'visible' => $validated['visible'] ?? null,
        ], fn ($v) => $v !== null && $v !== []));

        return $this->successResponse(collect(PageCopy::editable())->firstWhere('key', $section), 'Saved');
    }

    public function reset(string $section): JsonResponse
    {
        abort_unless(array_key_exists($section, PageCopy::defaults()), 404);
        PageCopy::reset($section);
        config('okjt.console.audit_model')::recordAbout('page_copy.reset', 'page', $section);

        return $this->successResponse(collect(PageCopy::editable())->firstWhere('key', $section), 'Back to the original wording');
    }
}
