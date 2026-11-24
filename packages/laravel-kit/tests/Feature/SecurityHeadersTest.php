<?php

namespace Okjt\Kit\Tests\Feature;

use Okjt\Kit\Http\Middleware\SecurityHeaders;
use Okjt\Kit\Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    /** The header Naoa sent before the kit had this middleware (backend/app/Http/Middleware/SecurityHeaders.php). */
    private const NAOA_CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https: wss:;";

    protected function defineRoutes($router): void
    {
        $router->get('/page', fn () => 'ok')->middleware(SecurityHeaders::class);
    }

    public function test_the_defaults_are_exactly_the_headers_naoa_sent(): void
    {
        $this->get('/page')
            ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
            ->assertHeader('X-XSS-Protection', '1; mode=block')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
            ->assertHeader('Content-Security-Policy', self::NAOA_CSP);
    }

    public function test_extra_sources_are_added_to_the_base_policy(): void
    {
        // naoa-dt's policy: Naoa's, plus data: and blob: connections.
        config(['okjt.security_headers.csp_extra' => ['connect-src' => ['data:', 'blob:', 'wss:']]]);

        $this->get('/page')->assertHeader(
            'Content-Security-Policy',
            str_replace("connect-src 'self' https: wss:;", "connect-src 'self' https: wss: data: blob:;", self::NAOA_CSP),
        );
    }

    public function test_a_new_directive_and_a_dropped_one(): void
    {
        config([
            'okjt.security_headers.csp.script-src' => null,
            'okjt.security_headers.csp_extra' => ['frame-src' => ['https://www.youtube.com']],
        ]);

        $csp = $this->get('/page')->headers->get('Content-Security-Policy');
        $this->assertStringNotContainsString('script-src', $csp);
        $this->assertStringEndsWith('frame-src https://www.youtube.com;', $csp);
    }

    public function test_a_header_set_to_null_is_not_sent(): void
    {
        config(['okjt.security_headers.headers.Strict-Transport-Security' => null]);

        $this->get('/page')->assertHeaderMissing('Strict-Transport-Security');
    }

    public function test_report_only_and_switched_off(): void
    {
        config(['okjt.security_headers.csp_report_only' => true]);
        $this->get('/page')
            ->assertHeaderMissing('Content-Security-Policy')
            ->assertHeader('Content-Security-Policy-Report-Only', self::NAOA_CSP);

        config(['okjt.security_headers.enabled' => false]);
        $this->get('/page')->assertHeaderMissing('X-Frame-Options')->assertHeaderMissing('Content-Security-Policy-Report-Only');
    }
}
