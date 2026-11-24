<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Auth\Notifications\ResetPassword;
use Okjt\Kit\Tests\Fixtures\User;
use Okjt\Kit\Tests\TestCase;

/**
 * Where the emailed reset link opens. The kit points it at the app
 * ({app.frontend_url}{path}/{token}) only when the project asks for that, or
 * has no reset page of its own: Laravel's frontend_url defaults to
 * http://localhost:3000, so an app serving its own `password.reset` page (an
 * Inertia app like TFE or Tena-host) got links to localhost.
 */
class ResetLinkTest extends TestCase
{
    protected function defineEnvironment($app): void
    {
        parent::defineEnvironment($app);
        $app['config']->set('app.url', 'https://api.test');
        $app['config']->set('app.frontend_url', 'http://localhost:3000');
    }

    private function linkFor(?bool $linkToApp, bool $ownResetPage): string
    {
        if ($ownResetPage) {
            $this->app['router']->get('/reset-password/{token}', fn () => 'reset')->name('password.reset');
            $this->app['router']->getRoutes()->refreshNameLookups();
        }
        if ($linkToApp !== null) {
            config()->set('okjt.auth.password_reset.link_to_app', $linkToApp);
        }

        return (new ResetPassword('tok123'))->toMail(new User(['email' => 'gus@example.com']))->actionUrl;
    }

    public function test_an_app_with_its_own_reset_page_gets_its_own_link(): void
    {
        $this->assertSame(url('/reset-password/tok123').'?email=gus%40example.com', $this->linkFor(null, true));
    }

    public function test_an_app_without_one_gets_the_kit_link_to_the_app(): void
    {
        $this->assertSame('http://localhost:3000/reset-password/tok123?email=gus%40example.com', $this->linkFor(null, false));
    }

    public function test_link_to_app_true_always_links_to_the_app(): void
    {
        $this->assertStringStartsWith('http://localhost:3000/reset-password/tok123?', $this->linkFor(true, true));
    }

    public function test_link_to_app_false_leaves_the_link_to_laravel(): void
    {
        $this->assertSame(url('/reset-password/tok123').'?email=gus%40example.com', $this->linkFor(false, true));
    }
}
