<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Validation\Rule;
use Okjt\Kit\Support\ApiResponse;
use Okjt\Kit\Support\Messages;

/**
 * The platform's console, for its staff (put the routes behind
 * EnsureSuperadmin): every workspace, suspending or archiving one, deleting
 * one for good, and the audit log of what staff did. It shows a workspace's
 * details and counts, never its content.
 *
 *   GET    /console/workspaces          ?search=&status=   (25 a page)
 *   PATCH  /console/workspaces/{id}/status   { status, reason }
 *   DELETE /console/workspaces/{id}          { confirm: its slug, reason }
 *   GET    /console/audit                                   (50 a page)
 *
 * Projects add their own pages (accounts, plans, payments) beside these, and
 * change how a workspace is shown (workspaceRow) and erased (erase).
 */
class ConsoleController extends Controller
{
    use ApiResponse;

    public function workspaces(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $page = $this->workspaceQuery()
            ->when($search !== '', fn ($q) => $q->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('slug', 'like', "%{$search}%")))
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest('id')
            ->paginate(25);

        return $this->paged($page, fn (Model $w) => $this->workspaceListRow($w));
    }

    /** Suspend (its people and visitors are locked out), reactivate, or archive a workspace. */
    public function setStatus(Request $request, string $workspace): JsonResponse
    {
        $workspace = $this->findWorkspace($workspace);
        $validated = $request->validate([
            'status' => ['required', Rule::in(config('okjt.console.statuses'))],
            'reason' => 'required|string|max:255',
        ]);
        $before = $workspace->status;
        $workspace->forceFill(['status' => $validated['status']])->save();
        $this->auditModel()::record($this->auditModel()::subjectType($workspace).'.status_changed', $workspace, [
            'before' => $before, 'after' => $workspace->status, 'reason' => $validated['reason'],
        ]);

        return $this->successResponse($this->workspaceRow($workspace), ucfirst((string) config('okjt.label'))." {$workspace->status}");
    }

    /** Delete for good. The caller types the workspace's web address (its slug) to confirm. */
    public function destroyWorkspace(Request $request, string $workspace): JsonResponse
    {
        $workspace = $this->findWorkspace($workspace);
        $validated = $request->validate([
            'confirm' => ['required', 'string', Rule::in([$workspace->slug])],
            'reason' => 'required|string|max:255',
        ], ['confirm.in' => Messages::get('confirm_address')]);

        $this->auditModel()::record($this->auditModel()::subjectType($workspace).'.deleted', $workspace, $this->deletedDetails($workspace) + ['reason' => $validated['reason']]);
        $removed = $this->erase($workspace);

        return $this->successResponse(['removed' => $removed], ucfirst((string) config('okjt.label')).' deleted');
    }

    public function audit(): JsonResponse
    {
        $page = $this->auditModel()::query()->with('user:id,name,email')->latest('id')->paginate(50);

        return $this->paged($page, fn ($log) => [
            'id' => $log->id,
            'action' => $log->action,
            'subject_type' => $log->subject_type,
            'subject_id' => $log->subject_id,
            'subject_label' => $log->subject_label,
            'details' => $log->details,
            'by' => $log->user ? ['name' => $log->user->name, 'email' => $log->user->email] : null,
            'ip' => $log->ip,
            'at' => $log->created_at?->toISOString(),
        ]);
    }

    /** A page of rows, as the dashboard's lists read it: { data, meta }. */
    protected function paged(LengthAwarePaginator $page, callable $row): JsonResponse
    {
        return $this->successResponse([
            'data' => collect($page->items())->map($row)->all(),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()],
        ]);
    }

    /** @return class-string<\Okjt\Kit\Console\AuditLog> */
    protected function auditModel(): string
    {
        return config('okjt.console.audit_model');
    }

    // ---- What a project changes ---------------------------------------------

    /** The workspaces the list starts from (add eager loads here). */
    protected function workspaceQuery(): Builder
    {
        return config('okjt.workspace.model')::query();
    }

    /** A workspace as the console sees it: its details and counts, nothing of its content. */
    protected function workspaceRow(Model $workspace): array
    {
        return [
            'id' => $workspace->id,
            'name' => $workspace->name,
            'slug' => $workspace->slug,
            'status' => $workspace->status,
            'published' => $workspace->isPublished(),
            'created_at' => $workspace->created_at?->toISOString(),
        ];
    }

    /** A row of the list (by default the same as workspaceRow). */
    protected function workspaceListRow(Model $workspace): array
    {
        return $this->workspaceRow($workspace);
    }

    /** What the audit log keeps about a deleted workspace. */
    protected function deletedDetails(Model $workspace): array
    {
        return ['slug' => $workspace->slug];
    }

    /** Delete the workspace and everything in it; returns what was removed, as counts. */
    protected function erase(Model $workspace): array
    {
        $workspace->delete();

        return [config('okjt.label') => 1];
    }

    /** The workspace a console URL names, by its route key. */
    protected function findWorkspace(string $key): Model
    {
        $model = config('okjt.workspace.model');

        return (new $model)->resolveRouteBinding($key) ?? abort(404);
    }
}
