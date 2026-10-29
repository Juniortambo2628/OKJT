<?php

namespace Okjt\Kit\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Okjt\Kit\Support\Messages;
use Okjt\Kit\Workspace\CurrentWorkspace;
use Symfony\Component\HttpFoundation\Response;

/**
 * Picks the workspace an API request works on — from the header
 * (okjt.workspace.header), or the query parameter (okjt.workspace.query) for
 * plain links that can't carry a header — and makes it current, so every
 * workspace-owned query is scoped to it.
 *
 * An inactive or unpublished workspace answers only its own signed-in people.
 * Routes about the person rather than a workspace (okjt.workspace.open_routes)
 * don't need one; every other route is refused without one rather than run
 * unscoped.
 */
class ResolveWorkspace
{
    public function handle(Request $request, Closure $next): Response
    {
        CurrentWorkspace::set(null);
        $key = $request->header(config('okjt.workspace.header')) ?? $request->query(config('okjt.workspace.query'));
        $open = config('okjt.workspace.open_routes', []);

        if (is_string($key) && $key !== '') {
            $workspace = config('okjt.workspace.model')::findByKey($key);
            if (! $workspace) {
                return $this->fail(Messages::get('not_found'), 404);
            }
            CurrentWorkspace::set($workspace);

            if (! $workspace->isActive() && ! $request->is(...$open) && ! $request->user('sanctum')?->isMemberOf($workspace)) {
                return $this->fail(Messages::get('unavailable'), 404, 'unavailable');
            }

            if (! $workspace->isPublished() && ! $request->is(...$open)) {
                $user = $request->user('sanctum');
                if (! $user || ! $user->isMemberOf($workspace)) {
                    return $this->fail(Messages::get('unpublished'), 404, 'unpublished');
                }
            }
        } elseif (! $request->is(...$open)) {
            return $this->fail(Messages::get('none_selected'), 400);
        }

        return $next($request);
    }

    /** `reason` tells the app why: unavailable, unpublished, or the workspace's label. */
    private function fail(string $message, int $status, ?string $reason = null): Response
    {
        return response()->json(['success' => false, 'message' => $message, 'reason' => $reason ?? config('okjt.label')], $status);
    }
}
