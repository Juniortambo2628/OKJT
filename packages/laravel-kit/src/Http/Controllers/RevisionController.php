<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Okjt\Kit\Revisions\Revision;
use Okjt\Kit\Support\ApiResponse;

/**
 * Version history of the current workspace's records, and restoring old
 * versions. Routes (behind auth and EnforceRole):
 *
 *   GET  /revisions                       ?module=&per_page=
 *   POST /revisions/{revision}/restore    ?batch=1 restores everything saved with it
 */
class RevisionController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'module' => 'nullable|string|max:40',
            'per_page' => 'nullable|integer|min:5|max:100',
        ]);

        $page = $this->revisions()::with('user:id,name')
            ->when($validated['module'] ?? null, fn ($q, $module) => $q->where('module', $module))
            ->latest('id')
            ->paginate($validated['per_page'] ?? 30);

        $page->getCollection()->transform(fn (Revision $revision) => $this->present($revision));

        return $this->successResponse($page);
    }

    public function restore(Request $request, Revision $revision): JsonResponse
    {
        $wholeBatch = $request->boolean('batch') && $revision->batch;

        // A batch restores the newest version of each record changed together
        // (e.g. every setting saved at once), in the order they were made.
        $revisions = $wholeBatch
            ? $this->revisions()::where('batch', $revision->batch)->orderBy('id')->get()
                ->groupBy(fn ($r) => $r->subject_type.'#'.$r->subject_id)
                ->map->last()
                ->values()
            : collect([$revision]);

        $unrestorable = $revisions->reject->isRestorable();
        if ($unrestorable->isNotEmpty()) {
            return $this->errorResponse('This version can no longer be restored.', 422);
        }

        $revisions->each->restoreVersion();

        return $this->successResponse(
            ['restored' => $revisions->count()],
            $revisions->count() === 1 ? 'Version restored' : "{$revisions->count()} changes restored"
        );
    }

    /** The revision model in use (okjt.revisions.model). */
    protected function revisions(): string
    {
        return config('okjt.revisions.model', Revision::class);
    }

    protected function present(Revision $revision): array
    {
        return [
            'id' => $revision->id,
            'module' => $revision->module,
            'subject_type' => class_basename($revision->subject_type),
            'subject_id' => $revision->subject_id,
            'subject_label' => $revision->subject_label,
            'action' => $revision->action,
            'changes' => $revision->diff(),
            'user' => $revision->user ? ['id' => $revision->user->id, 'name' => $revision->user->name] : null,
            'batch' => $revision->batch,
            'restorable' => $revision->isRestorable(),
            'created_at' => $revision->created_at,
            'updated_at' => $revision->updated_at,
        ];
    }
}
