<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Laravel\Socialite\Contracts\User as SocialUser;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as GoogleUser;
use Okjt\Kit\Http\Controllers\SocialAuthController;
use Okjt\Kit\Tests\Fixtures\Project;
use Okjt\Kit\Tests\Fixtures\User;
use Okjt\Kit\Tests\TestCase;

/** A project's first Google sign-in also creates their project. */
class GoogleSignIn extends SocialAuthController
{
    protected function joined(Model $user, SocialUser $social): void
    {
        $user->setRoleIn(Project::create(['slug' => 'first']), 'owner');
    }
}

class SocialAuthTest extends TestCase
{
    protected function getPackageProviders($app): array
    {
        return [...parent::getPackageProviders($app), \Laravel\Socialite\SocialiteServiceProvider::class];
    }

    protected function defineEnvironment($app): void
    {
        parent::defineEnvironment($app);
        $app['config']->set('auth.guards.sanctum', ['driver' => 'sanctum', 'provider' => 'users']);
        $app['config']->set('app.frontend_url', 'https://app.test/');
    }

    protected function defineRoutes($router): void
    {
        $router->get('/auth/google/callback', [GoogleSignIn::class, 'callback']);
        $router->post('/api/auth/google', [GoogleSignIn::class, 'login']);
    }

    private function google(string $email, ?string $name = 'Ann'): void
    {
        $user = (new GoogleUser)->map(['email' => $email, 'name' => $name, 'nickname' => null]);
        Socialite::shouldReceive('driver->user')->andReturn($user);
    }

    private function codeFrom(string $location): string
    {
        $this->assertStringStartsWith('https://app.test/auth/google?code=', $location);

        return substr($location, strlen('https://app.test/auth/google?code='));
    }

    public function test_a_first_google_sign_in_creates_a_verified_owner_and_their_project(): void
    {
        $this->google('ann@example.com');

        $code = $this->codeFrom($this->get('/auth/google/callback')->assertRedirect()->headers->get('location'));

        $user = User::where('email', 'ann@example.com')->firstOrFail();
        $this->assertSame('Ann', $user->name);
        $this->assertSame('owner', $user->role);
        $this->assertNotNull($user->email_verified_at);
        $this->assertSame('owner', $user->roleIn(Project::where('slug', 'first')->firstOrFail()));
        $this->assertSame($user->id, Cache::get("social-login:$code"));
    }

    public function test_a_returning_person_is_signed_in_and_their_address_verified(): void
    {
        $user = $this->person('bo@example.com');
        $this->google('bo@example.com', null);

        $code = $this->codeFrom($this->get('/auth/google/callback')->headers->get('location'));

        $this->assertSame(1, User::count());
        $this->assertSame(0, Project::count());
        $this->assertNotNull($user->fresh()->email_verified_at);

        $this->postJson('/api/auth/google', ['code' => $code])
            ->assertOk()
            ->assertJsonPath('data.user.email', 'bo@example.com')
            ->assertJsonPath('data.token', fn ($token) => ! empty($token));

        // The code works once.
        $this->postJson('/api/auth/google', ['code' => $code])
            ->assertStatus(422)
            ->assertJsonPath('message', 'That sign-in link expired — try again.');
    }

    public function test_a_nameless_newcomer_gets_the_default_name(): void
    {
        $this->google('cy@example.com', null);
        $this->get('/auth/google/callback');

        $this->assertSame('New user', User::where('email', 'cy@example.com')->value('name'));
    }

    public function test_two_step_verification_still_applies(): void
    {
        $user = $this->person('di@example.com');
        $user->forceFill(['two_factor_confirmed_at' => now()])->save();
        Cache::put('social-login:abc', $user->id, now()->addMinutes(5));

        $this->postJson('/api/auth/google', ['code' => 'abc'])
            ->assertOk()
            ->assertJsonPath('data.requires_2fa', true)
            ->assertJsonMissingPath('data.token');
    }

    public function test_a_deleted_account_is_not_found(): void
    {
        Cache::put('social-login:gone', 999, now()->addMinutes(5));

        $this->postJson('/api/auth/google', ['code' => 'gone'])
            ->assertNotFound()
            ->assertJsonPath('message', 'Account not found.');
    }
}
