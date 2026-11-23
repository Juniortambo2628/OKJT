<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Browser errors, reported by @okjt/ui's installErrorReporter. Lifted from
 * TFE (app/Http/Controllers/ClientErrorController.php, Sprint 69).
 *
 *   Route::post('/client-errors', [ClientErrorController::class, 'store'])
 *       ->middleware('throttle:30,1');
 *
 * Everything is capped and stripped on the way in:
 *  - page and source are reduced to a PATH: a query string can carry a
 *    token, an email or a payment reference;
 *  - nothing from okjt.client_errors.skip_paths is kept at all;
 *  - the user is an id, never a name or email;
 *  - it goes to its own log file (okjt.client_errors.channel; the kit adds a
 *    7-day daily file when the project hasn't defined the channel), not a
 *    table.
 *
 * Always 204: this is fire-and-forget from sendBeacon, and the reporter must
 * never be able to produce a second error by failing.
 */
class ClientErrorController extends Controller
{
    public function store(Request $request): Response
    {
        $data = $request->validate([
            'message' => 'required|string|max:2000',
            'page' => 'nullable|string|max:2000',
            'source' => 'nullable|string|max:2000',
            'line' => 'nullable|integer',
            'column' => 'nullable|integer',
            'stack' => 'nullable|string|max:8000',
            'kind' => 'nullable|in:error,unhandledrejection,console',
        ]);

        $page = self::pathOnly($data['page'] ?? null);
        $skip = (array) config('okjt.client_errors.skip_paths', []);

        if ($page !== null && $skip !== [] && Str::startsWith(ltrim($page, '/'), $skip)) {
            return response()->noContent();
        }

        Log::channel(config('okjt.client_errors.channel', 'okjt_client'))->warning(Str::limit($data['message'], 500), [
            'kind' => $data['kind'] ?? 'error',
            'page' => $page,
            'source' => self::pathOnly($data['source'] ?? null),
            'line' => $data['line'] ?? null,
            'column' => $data['column'] ?? null,
            'stack' => isset($data['stack']) ? Str::limit($data['stack'], 2000) : null,
            'user_id' => $request->user()?->getKey(),
            'agent' => Str::limit((string) $request->userAgent(), 200),
        ]);

        return response()->noContent();
    }

    /** "https://x/fan/bookings/9?token=abc#y" → "/fan/bookings/9". */
    public static function pathOnly(?string $url): ?string
    {
        if ($url === null || $url === '') {
            return null;
        }

        $path = parse_url($url, PHP_URL_PATH);

        return is_string($path) && $path !== '' ? $path : null;
    }
}
