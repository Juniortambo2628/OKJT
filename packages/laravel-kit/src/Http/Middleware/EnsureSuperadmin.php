<?php

namespace Okjt\Kit\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Okjt\Kit\Support\Messages;
use Symfony\Component\HttpFoundation\Response;

/**
 * Platform-level tools (the Console, whole-database backups) that only the
 * people who run the product may use (users.is_superadmin). Workspaces'
 * owners never see each other's data through them.
 */
class EnsureSuperadmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->is_superadmin) {
            return response()->json(['success' => false, 'message' => Messages::get('superadmin_only'), 'reason' => 'role'], 403);
        }

        return $next($request);
    }
}
