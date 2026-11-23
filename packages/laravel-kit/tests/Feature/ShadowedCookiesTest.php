<?php

namespace Okjt\Kit\Tests\Feature;

use Okjt\Kit\Http\Middleware\ForgetShadowedCookies;
use Okjt\Kit\Tests\TestCase;
use Symfony\Component\HttpFoundation\Cookie;

/**
 * Lifted from TFE (tests/Feature/Auth/ShadowedCookiesTest.php): a browser that
 * used the old site holds the session + XSRF cookies on ".okjtech.co.ke" as
 * well as ours on "tfe.okjtech.co.ke", sends both, and PHP reads the stale one
 * first, so every sign-in answered 419.
 */
class ShadowedCookiesTest extends TestCase
{
    protected function defineEnvironment($app): void
    {
        parent::defineEnvironment($app);
        $app['config']->set('session.cookie', 'app-session');
        $app['config']->set('session.domain', 'tfe.okjtech.co.ke');
    }

    protected function defineRoutes($router): void
    {
        $router->middleware(ForgetShadowedCookies::class)->get('/login', fn () => 'login');
    }

    private function visit(string $cookieHeader, string $host = 'tfe.okjtech.co.ke')
    {
        return $this->call('GET', "https://{$host}/login", [], [], [], [
            'HTTP_HOST' => $host,
            'HTTP_COOKIE' => $cookieHeader,
        ]);
    }

    /** @return list<string> name@domain of each cookie the response expires */
    private function expired($response): array
    {
        return collect($response->headers->getCookies())
            ->filter(fn (Cookie $c) => $c->getExpiresTime() > 0 && $c->getExpiresTime() < time())
            ->map(fn (Cookie $c) => $c->getName().'@'.$c->getDomain())
            ->values()->all();
    }

    public function test_duplicate_session_and_xsrf_cookies_are_expired_on_other_domains(): void
    {
        $response = $this->visit('app-session=old; XSRF-TOKEN=old; app-session=new; XSRF-TOKEN=new');

        $response->assertOk();
        $expired = $this->expired($response);
        $this->assertContains('app-session@.okjtech.co.ke', $expired);
        $this->assertContains('XSRF-TOKEN@.okjtech.co.ke', $expired);
        $this->assertContains('app-session@', $expired, 'host-only stale copy');
        // The live cookie, on the configured domain, must never be expired.
        $this->assertNotContains('app-session@.tfe.okjtech.co.ke', $expired);
        $this->assertNotContains('app-session@tfe.okjtech.co.ke', $expired);
    }

    public function test_nothing_is_expired_when_each_cookie_arrives_once(): void
    {
        $response = $this->visit('app-session=a; XSRF-TOKEN=b; other=x; other=y');

        $response->assertOk();
        $this->assertSame([], $this->expired($response));
    }

    public function test_the_session_cookie_stays_http_only_and_xsrf_readable_by_scripts(): void
    {
        $cookies = collect($this->visit('app-session=old; app-session=new; XSRF-TOKEN=a; XSRF-TOKEN=b')->headers->getCookies());

        $this->assertTrue($cookies->first(fn (Cookie $c) => $c->getName() === 'app-session')->isHttpOnly());
        $this->assertFalse($cookies->first(fn (Cookie $c) => $c->getName() === 'XSRF-TOKEN')->isHttpOnly());
    }

    public function test_a_project_can_watch_its_own_cookies(): void
    {
        config()->set('okjt.cookies.shadowed', ['workspace']);

        $expired = $this->expired($this->visit('workspace=1; workspace=2; app-session=a; app-session=b'));
        $this->assertContains('workspace@.okjtech.co.ke', $expired);
        $this->assertSame([], array_filter($expired, fn ($c) => str_starts_with($c, 'app-session@')));
    }

    public function test_an_ip_or_bare_host_expires_no_domain_copies(): void
    {
        config()->set('session.domain', null);
        $this->assertSame([], $this->expired($this->visit('app-session=a; app-session=b', '127.0.0.1')));
    }
}
