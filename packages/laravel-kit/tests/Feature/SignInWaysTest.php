<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification as Notifications;
use Okjt\Kit\Auth\LoginCode;
use Okjt\Kit\Auth\LoginCodeNotification;
use Okjt\Kit\Auth\TwoFactor;
use Okjt\Kit\Http\Controllers\AuthController;
use Okjt\Kit\Http\Controllers\ConfirmPasswordController;
use Okjt\Kit\Http\Controllers\LoginCodeController;
use Okjt\Kit\Http\Controllers\PasswordResetController;
use Okjt\Kit\Http\Controllers\TwoFactorController;
use Okjt\Kit\Tests\Fixtures\User;
use Okjt\Kit\Tests\TestCase;
use PragmaRX\Google2FA\Google2FA;

/** Session mode, email codes, password resets, confirming the password, recovery codes and throttling. */
class SignInWaysTest extends TestCase
{
    protected function defineEnvironment($app): void
    {
        parent::defineEnvironment($app);
        $app['config']->set('okjt.auth.mode', 'session');
        $app['config']->set('auth.guards.web', ['driver' => 'session', 'provider' => 'users']);
        $app['config']->set('auth.defaults.guard', 'web');
        $app['config']->set('app.frontend_url', 'https://app.test');
    }

    protected function defineRoutes($router): void
    {
        $router->middleware('web')->prefix('api')->group(function () use ($router) {
            $router->post('/login', [AuthController::class, 'login']);
            $router->post('/verify-2fa', [AuthController::class, 'verify2fa']);
            $router->post('/login-code', [LoginCodeController::class, 'request']);
            $router->post('/login-code/verify', [LoginCodeController::class, 'verify']);
            $router->post('/forgot-password', [PasswordResetController::class, 'forgot']);
            $router->post('/reset-password', [PasswordResetController::class, 'reset']);
            $router->middleware('auth:web')->group(function () use ($router) {
                $router->post('/logout', [AuthController::class, 'logout']);
                $router->get('/user', [AuthController::class, 'user']);
                $router->post('/confirm-password', [ConfirmPasswordController::class, 'confirm']);
                $router->get('/confirmed-password-status', [ConfirmPasswordController::class, 'status']);
                $router->post('/2fa/setup', [TwoFactorController::class, 'setup']);
                $router->post('/2fa/confirm', [TwoFactorController::class, 'confirm']);
                $router->get('/2fa/recovery-codes', [TwoFactorController::class, 'recoveryCodes']);
                $router->post('/2fa/recovery-codes', [TwoFactorController::class, 'regenerateRecoveryCodes']);
            });
        });
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    }

    private function verified(string $email, string $password = 'secret-pass'): User
    {
        $user = $this->person($email);
        $user->forceFill(['password' => $password, 'email_verified_at' => now()])->save();

        return $user;
    }

    private function withTwoFactor(User $user): string
    {
        $secret = TwoFactor::newSecret();
        TwoFactor::storeSecret($user, $secret);
        $user->forceFill(['two_factor_confirmed_at' => now()])->save();

        return $secret;
    }

    public function test_session_mode_signs_in_with_the_cookie_and_no_token(): void
    {
        $user = $this->verified('ann@example.com');

        $this->postJson('/api/login', ['email' => 'ann@example.com', 'password' => 'secret-pass', 'remember' => true])
            ->assertOk()->assertJsonMissingPath('data.token')->assertJsonPath('data.user.email', 'ann@example.com');
        $this->assertAuthenticatedAs($user, 'web');
        $this->assertNotNull($user->fresh()->remember_token);

        $this->getJson('/api/user')->assertOk()->assertJsonPath('data.email', 'ann@example.com');
        $this->postJson('/api/logout')->assertOk();
        $this->assertGuest('web');
    }

    public function test_two_step_sign_in_in_session_mode_and_recovery_codes(): void
    {
        $user = $this->verified('bo@example.com');
        $secret = $this->withTwoFactor($user);

        $challenge = $this->postJson('/api/login', ['email' => 'bo@example.com', 'password' => 'secret-pass'])
            ->assertJsonPath('data.requires_2fa', true)->json('data.challenge');
        $this->assertGuest('web');

        $this->postJson('/api/verify-2fa', ['challenge' => $challenge, 'code' => (new Google2FA)->getCurrentOtp($secret)])->assertOk();
        $this->assertAuthenticatedAs($user, 'web');

        // Recovery codes: shown, each works once, and can be replaced.
        $codes = $this->postJson('/api/2fa/recovery-codes')->assertOk()->json('recovery_codes');
        $this->assertCount(8, $codes);
        $this->assertSame($codes, $this->getJson('/api/2fa/recovery-codes')->json('recovery_codes'));
        Auth::guard('web')->logout();

        $challenge = $this->postJson('/api/login', ['email' => 'bo@example.com', 'password' => 'secret-pass'])->json('data.challenge');
        $this->postJson('/api/verify-2fa', ['challenge' => $challenge, 'code' => $codes[0]])->assertOk();
        $this->assertNotContains($codes[0], TwoFactor::recoveryCodesOf($user->fresh()));
        $this->assertCount(8, TwoFactor::recoveryCodesOf($user->fresh()));
        Auth::guard('web')->logout();

        $challenge = $this->postJson('/api/login', ['email' => 'bo@example.com', 'password' => 'secret-pass'])->json('data.challenge');
        $this->postJson('/api/verify-2fa', ['challenge' => $challenge, 'code' => $codes[0]])->assertStatus(422);
    }

    public function test_secrets_and_recovery_codes_can_be_kept_encrypted_as_fortify_keeps_them(): void
    {
        config(['okjt.auth.two_factor.secrets_encrypted' => true]);
        $user = $this->verified('cy@example.com');
        $this->actingAs($user, 'web');

        $secret = $this->postJson('/api/2fa/setup')->assertOk()->json('secret');
        $this->assertNotSame($secret, $user->fresh()->two_factor_secret);
        $this->assertSame($secret, decrypt($user->fresh()->two_factor_secret));

        $codes = $this->postJson('/api/2fa/confirm', ['code' => (new Google2FA)->getCurrentOtp($secret)])->assertOk()->json('recovery_codes');
        $this->assertSame($codes, json_decode(decrypt($user->fresh()->two_factor_recovery_codes), true));
        $this->assertTrue(TwoFactor::check($user->fresh(), (new Google2FA)->getCurrentOtp($secret)));
    }

    public function test_wrong_passwords_are_throttled(): void
    {
        $this->verified('di@example.com');
        foreach (range(1, 5) as $i) {
            $this->postJson('/api/login', ['email' => 'di@example.com', 'password' => 'wrong'])->assertStatus(422);
        }
        $this->postJson('/api/login', ['email' => 'di@example.com', 'password' => 'secret-pass'])
            ->assertStatus(422)->assertJsonValidationErrors('email');
        $this->assertGuest('web');

        $this->travel(61)->seconds();
        $this->postJson('/api/login', ['email' => 'di@example.com', 'password' => 'secret-pass'])->assertOk();
    }

    public function test_signing_in_with_an_emailed_code(): void
    {
        Notifications::fake();
        $user = $this->verified('ed@example.com');

        $this->postJson('/api/login-code', ['email' => 'nobody@example.com'])->assertOk();
        $this->postJson('/api/login-code', ['email' => 'ed@example.com'])->assertOk()
            ->assertJson(['message' => 'If that address exists, a sign-in code is on its way.']);
        Notifications::assertCount(1);

        $code = null;
        Notifications::assertSentTo($user, LoginCodeNotification::class, function ($n) use (&$code) {
            $code = $n->code;

            return true;
        });
        $this->assertNotSame($code, LoginCode::first()->code_hash);

        $this->postJson('/api/login-code/verify', ['email' => 'ed@example.com', 'code' => '12345x'])->assertStatus(422)->assertJsonValidationErrors('code');
        $this->postJson('/api/login-code/verify', ['email' => 'ed@example.com', 'code' => $code])->assertOk()->assertJsonPath('data.user.email', 'ed@example.com');
        $this->assertAuthenticatedAs($user, 'web');

        // Once only.
        Auth::guard('web')->logout();
        $this->postJson('/api/login-code/verify', ['email' => 'ed@example.com', 'code' => $code])->assertStatus(422);
    }

    public function test_an_emailed_code_still_asks_for_the_second_step_and_expires(): void
    {
        Notifications::fake();
        $user = $this->verified('fay@example.com');
        $this->withTwoFactor($user);

        $this->postJson('/api/login-code', ['email' => 'fay@example.com']);
        $code = Notifications::sent($user, LoginCodeNotification::class)->first()->code;
        $this->postJson('/api/login-code/verify', ['email' => 'fay@example.com', 'code' => $code])
            ->assertOk()->assertJsonPath('data.requires_2fa', true);
        $this->assertGuest('web');

        $this->postJson('/api/login-code', ['email' => 'fay@example.com']);
        $code = Notifications::sent($user, LoginCodeNotification::class)->last()->code;
        $this->travel(11)->minutes();
        $this->postJson('/api/login-code/verify', ['email' => 'fay@example.com', 'code' => $code])->assertStatus(422);
    }

    public function test_resetting_a_forgotten_password(): void
    {
        Notifications::fake();
        $user = $this->verified('gus@example.com');
        $oldRemember = $user->remember_token;

        $this->postJson('/api/forgot-password', ['email' => 'nobody@example.com'])->assertOk();
        $this->postJson('/api/forgot-password', ['email' => 'gus@example.com'])->assertOk();

        $token = null;
        Notifications::assertSentTo($user, ResetPassword::class, function ($n) use (&$token, $user) {
            $token = $n->token;
            $this->assertStringStartsWith("https://app.test/reset-password/{$n->token}?email=", $n->toMail($user)->actionUrl);

            return true;
        });

        $this->postJson('/api/reset-password', ['token' => 'nope', 'email' => 'gus@example.com', 'password' => 'brand-new-pass', 'password_confirmation' => 'brand-new-pass'])
            ->assertStatus(422)->assertJsonValidationErrors('email');
        $this->postJson('/api/reset-password', ['token' => $token, 'email' => 'gus@example.com', 'password' => 'brand-new-pass', 'password_confirmation' => 'brand-new-pass'])
            ->assertOk();

        $this->assertNotSame($oldRemember, $user->fresh()->remember_token);
        $this->postJson('/api/login', ['email' => 'gus@example.com', 'password' => 'brand-new-pass'])->assertOk();
    }

    public function test_confirming_the_password(): void
    {
        $this->actingAs($this->verified('hal@example.com'), 'web');

        $this->getJson('/api/confirmed-password-status')->assertJsonPath('data.confirmed', false);
        $this->postJson('/api/confirm-password', ['password' => 'wrong'])->assertStatus(422)->assertJsonValidationErrors('password');
        $this->postJson('/api/confirm-password', ['password' => 'secret-pass'])->assertOk();
        $this->getJson('/api/confirmed-password-status')->assertJsonPath('data.confirmed', true);
    }
}
