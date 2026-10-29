<?php

namespace Okjt\Kit\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Okjt\Kit\Support\Messages;
use Okjt\Kit\Workspace\CurrentWorkspace;
use Symfony\Component\HttpFoundation\Response;

/**
 * Role checks for the API, in the current workspace (see ResolveWorkspace):
 * you must be one of its people, and your role there decides what you may do.
 *
 *   ->middleware(EnforceRole::class)          viewers may only read
 *   ->middleware(EnforceRole::class.':owner') owners only
 *
 * Writes a viewer may still make are okjt.roles.viewer_writes.
 */
class EnforceRole
{
    public function handle(Request $request, Closure $next, ?string $role = null): Response
    {
        $user = $request->user();
        if (! $user) {
            return $next($request);
        }

        $workspace = CurrentWorkspace::get();
        if ($workspace && ! $user->isMemberOf($workspace)) {
            return $this->deny(Messages::get('no_access'));
        }

        if ($workspace && ! $workspace->isActive()) {
            return $this->deny(Messages::get('inactive'));
        }

        if ($role === config('okjt.roles.owner') && ! $user->isOwner()) {
            return $this->deny(Messages::get('owners_only'));
        }

        if ($user->role === config('okjt.roles.viewer') && ! $request->isMethodSafe() && ! $request->is(...config('okjt.roles.viewer_writes', []))) {
            return $this->deny(Messages::get('view_only'));
        }

        return $next($request);
    }

    private function deny(string $message): Response
    {
        return response()->json(['success' => false, 'message' => $message, 'reason' => 'role'], 403);
    }
}
