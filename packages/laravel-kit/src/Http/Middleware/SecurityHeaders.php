<?php

namespace Okjt\Kit\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Security headers on every response, from okjt.security_headers.
 *
 *   ->withMiddleware(fn ($m) => $m->append(\Okjt\Kit\Http\Middleware\SecurityHeaders::class))
 *
 * The defaults are the headers Naoa and naoa-dt sent before the kit had this,
 * so swapping their own copy for this one changes nothing. A project adds to
 * the policy with csp_extra (e.g. websockets for live updates, blob: for
 * camera captures) rather than copying the whole of it, so later kit fixes to
 * the base policy still reach it.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $settings = config('okjt.security_headers', []);
        if (! ($settings['enabled'] ?? true)) {
            return $response;
        }

        foreach ($settings['headers'] ?? [] as $name => $value) {
            if ($value !== null && $value !== '') {
                $response->headers->set($name, $value);
            }
        }

        $policy = static::policy($settings['csp'] ?? [], $settings['csp_extra'] ?? []);
        if ($policy !== '') {
            $header = ($settings['csp_report_only'] ?? false)
                ? 'Content-Security-Policy-Report-Only'
                : 'Content-Security-Policy';
            $response->headers->set($header, $policy);
        }

        return $response;
    }

    /**
     * The policy as one header value: each directive and its sources, extra
     * sources added after the base ones (no repeats), "dir a b; dir c;".
     * A directive set to null in csp is left out.
     *
     * @param  array<string, list<string>|null>  $csp
     * @param  array<string, list<string>>  $extra
     */
    public static function policy(array $csp, array $extra = []): string
    {
        foreach ($extra as $directive => $sources) {
            $csp[$directive] = array_values(array_unique([...($csp[$directive] ?? []), ...(array) $sources]));
        }

        $parts = [];
        foreach ($csp as $directive => $sources) {
            if ($sources === null) {
                continue;
            }
            $parts[] = trim($directive.' '.implode(' ', (array) $sources)).';';
        }

        return implode(' ', $parts);
    }
}
