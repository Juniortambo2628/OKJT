<?php

namespace Okjt\Kit\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Okjt\Kit\Switches\Switches;
use Symfony\Component\HttpFoundation\Response;

/**
 * A feature's routes answer 404 while its switch is off, as if they didn't
 * exist (Naoa's StkPushEnabled):
 *
 *   Route::middleware(RequireSwitch::class.':mpesa_extras')->group(...)
 */
class RequireSwitch
{
    public function handle(Request $request, Closure $next, string $key): Response
    {
        abort_unless(Switches::on($key), 404);

        return $next($request);
    }
}
