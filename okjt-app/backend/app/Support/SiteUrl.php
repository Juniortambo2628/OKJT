<?php

namespace App\Support;

use Illuminate\Support\Str;

/** Full addresses on the public site (okjtech.co.ke), for tags, feeds and copies posted elsewhere. */
class SiteUrl
{
    public static function origin(): string
    {
        return rtrim(config('app.frontend_url'), '/');
    }

    /** A page's full address: "/insights/x" → "https://okjtech.co.ke/insights/x". */
    public static function page(string $path): string
    {
        return self::origin().'/'.ltrim($path, '/');
    }

    /** An image or file's full address, from a stored path, an /api/storage address or a full URL. */
    public static function absolute(string $path): string
    {
        $origin = self::origin();
        if (preg_match('#^https?://[^/]+(?:/api)?/storage/(.+)$#', $path, $m)) {
            return $origin.'/storage/'.$m[1];
        }
        if (Str::startsWith($path, ['http://', 'https://', 'mailto:', 'tel:', '#'])) {
            return $path;
        }
        $clean = ltrim($path, '/');
        if (Str::startsWith($clean, ['assets/', 'logos/', 'storage/'])) {
            return $origin.'/'.$clean;
        }

        return $origin.'/storage/'.$clean;
    }
}
