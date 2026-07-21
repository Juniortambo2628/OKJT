<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AddCacheHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only add cache headers for GET requests on public API routes
        if ($request->isMethod('GET') && ! $request->user()) {
            // Cache for 1 minute in browser, 5 minutes in CDN
            $response->headers->set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=60');

            // Add ETag based on response content for conditional requests
            $content = $response->getContent();
            if ($content) {
                $etag = '"'.md5($content).'"';
                $response->headers->set('ETag', $etag);

                // Check If-None-Match header
                $ifNoneMatch = $request->header('If-None-Match');
                if ($ifNoneMatch && $ifNoneMatch === $etag) {
                    return response('', 304)
                        ->header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=60')
                        ->header('ETag', $etag);
                }
            }
        }

        return $response;
    }
}
