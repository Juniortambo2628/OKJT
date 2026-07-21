<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class RevalidationService
{
    protected string $nextUrl;

    protected string $secret;

    public function __construct()
    {
        $this->nextUrl = config('app.next_url', 'http://localhost:3000');
        $this->secret = config('app.next_revalidation_secret', 'okjt-webhook-secret-change-me-in-production');
    }

    public function revalidatePaths(array $paths): bool
    {
        try {
            $response = Http::post("{$this->nextUrl}/api/revalidate", [
                'secret' => $this->secret,
                'paths' => $paths,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            report($e);

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
