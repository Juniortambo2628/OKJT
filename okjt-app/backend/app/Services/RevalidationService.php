<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RevalidationService
{
    protected string $nextUrl;

    protected string $secret;

    public function __construct()
    {
        $this->nextUrl = rtrim((string) config('app.next_url', 'http://localhost:3000'), '/');
        $this->secret = config('app.next_revalidation_secret', 'okjt-webhook-secret-change-me-in-production');
    }

    /**
     * Ask the Next.js frontend to drop its cached copy of the given paths.
     *
     * Best-effort only: a slow or unreachable frontend must never block or fail
     * the CMS write that triggered it, so this always swallows failures and
     * returns false rather than throwing.
     */
    public function revalidatePaths(array $paths): bool
    {
        try {
            $response = Http::connectTimeout(2)
                ->timeout(4)
                ->acceptJson()
                ->post("{$this->nextUrl}/revalidate-cache", [
                    'secret' => $this->secret,
                    'paths' => $paths,
                ]);

            if (! $response->successful()) {
                Log::warning('Revalidation call returned '.$response->status(), [
                    'url' => "{$this->nextUrl}/revalidate-cache",
                ]);
            }

            return $response->successful();
        } catch (\Throwable $e) {
            Log::warning('Revalidation call failed: '.$e->getMessage(), [
                'url' => "{$this->nextUrl}/revalidate-cache",
            ]);

            return false;
        }
    }

    public function revalidateAll(): bool
    {
        return $this->revalidatePaths([
            '/',
            '/services',
            '/insights',
            '/projects',
            '/contact',
            '/our-approach',
            '/about',
            '/client-impact',
        ]);
    }
}
