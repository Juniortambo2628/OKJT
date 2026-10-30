<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Notification as Notifications;
use Okjt\Kit\Http\Controllers\AuthController;
use Okjt\Kit\Http\Controllers\EmailVerificationController;
use Okjt\Kit\Http\Controllers\NotificationController;
use Okjt\Kit\Http\Controllers\TwoFactorController;
use Okjt\Kit\Http\Middleware\ResolveWorkspace;
use Okjt\Kit\Notifications\NotifiesWorkspace;
use Okjt\Kit\Tests\Fixtures\Project;
use Okjt\Kit\Tests\Fixtures\User;
use Okjt\Kit\Tests\TestCase;
use Okjt\Kit\Workspace\CurrentWorkspace;
use PragmaRX\Google2FA\Google2FA;

/** A project's sign-up: a business name, and the project created for it. */
class SignUp extends AuthController
{
    protected function registrationRules(): array
    {
        return ['business' => 'required|string|max:120'];
    }

    protected function registered(Model $user, array $validated): array
    {
        $project = Project::create(['slug' => str($validated['business'])->slug()]);
        $user->setRoleIn($project, 'owner');

        return ['project' => $project->slug];
    }
}

class Notifier
{
    use NotifiesWorkspace {
        notifyAdmin as public;
    }
}

class AuthTest extends TestCase
{
    protected function defineEnvironment($app): void
    {
        parent::defineEnvironment($app);
        $app['config']->set('auth.guards.sanctum', ['driver' => 'sanctum', 'provider' => 'users']);
        $app['config']->set('okjt.workspace.open_routes', ['api/login', 'api/verify-2fa', 'api/register', 'api/email/*', 'api/logout', 'api/user', 'api/2fa/*']);
    }

    protected function defineRoutes($router): void
    {
        $router->middleware(ResolveWorkspace::class)->prefix('api')->group(function () use ($router) {
            $router->post('/login', [AuthController::class, 'login']);
            $router->post('/verify-2fa', [AuthController::class, 'verify2fa']);
            $router->post('/register', [SignUp::class, 'register']);
            $router->post('/email/verify', [EmailVerificationController::class, 'verify']);
            $router->post('/email/resend', [EmailVerificationController::class, 'resend']);
            $router->middleware('auth:sanctum')->group(function () use ($router) {
                $router->post('/logout', [AuthController::class, 'logout']);
                $router->get('/user', [AuthController::class, 'user']);
                $router->post('/2fa/setup', [TwoFactorController::class, 'setup']);
                $router->post('/2fa/confirm', [TwoFactorController::class, 'confirm']);
                $router->post('/2fa/disable', [TwoFactorController::class, 'disable']);
                $router->get('/notifications', [NotificationController::class, 'index']);
                $router->post('/notifications/mark-read', [NotificationController::class, 'markAllRead']);
            });
        });
    }

    private function verified(string $email, string $password = 'secret-pass'): User
    {
        $user = $this->person($email);
        $user->forceFill(['password' => $password, 'email_verified_at' => now()])->save();

        return $user;
    }

    public function test_signing_in_needs_the_right_password_a_verified_email_and_any_second_step(): void
    {
        $this->verified('ann@example.com');
        $this->postJson('/api/login', ['email' => 'ann@example.com', 'password' => 'wrong'])->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'The provided credentials are incorrect.');

        $token = $this->postJson('/api/login', ['email' => 'ann@example.com', 'password' => 'secret-pass'])->assertOk()
            ->assertJsonPath('data.user.email', 'ann@example.com')->json('data.token');
        $this->getJson('/api/user', ['Authorization' => "Bearer $token"])->assertOk()->assertJsonPath('data.name', 'Ann');

        $this->person('new@example.com')->forceFill(['password' => 'secret-pass'])->save();
        $this->postJson('/api/login', ['email' => 'new@example.com', 'password' => 'secret-pass'])
            ->assertOk()->assertJson(['message' => 'Please verify your email before signing in.', 'data' => ['requires_verification' => true]]);
    }

    public function test_two_step_verification_from_setup_to_sign_in(): void
    {
        $user = $this->verified('bo@example.com');
        $token = $user->createToken('t')->plainTextToken;
        $auth = ['Authorization' => "Bearer $token"];

        $secret = $this->postJson('/api/2fa/setup', [], $auth)->assertOk()->assertJsonStructure(['secret', 'qr_code_svg'])->json('secret');
        $this->assertStringContainsString('<svg', $this->postJson('/api/2fa/setup', [], $auth)->json('qr_code_svg'));
        $secret = $user->fresh()->two_factor_secret;
        $this->postJson('/api/2fa/confirm', ['code' => '000000'], $auth)->assertStatus(422);
        $this->postJson('/api/2fa/confirm', ['code' => (new Google2FA)->getCurrentOtp($secret)], $auth)->assertOk();

        $this->postJson('/api/login', ['email' => 'bo@example.com', 'password' => 'secret-pass'])->assertJsonPath('data.requires_2fa', true);
        $this->postJson('/api/verify-2fa', ['email' => 'bo@example.com', 'code' => '000000'])->assertStatus(422)->assertJson(['message' => 'Invalid 2FA code']);
        $this->postJson('/api/verify-2fa', ['email' => 'bo@example.com', 'code' => (new Google2FA)->getCurrentOtp($secret)])
            ->assertOk()->assertJsonStructure(['data' => ['token', 'user']]);

        $this->postJson('/api/2fa/disable', [], $auth)->assertOk();
        $this->assertNull($user->fresh()->two_factor_confirmed_at);
    }

    public function test_sign_up_creates_what_the_project_needs_and_sends_the_verification_email(): void
    {
        Notifications::fake();
        $this->postJson('/api/register', ['name' => 'Cy', 'email' => 'cy@example.com', 'password' => 'long-enough', 'password_confirmation' => 'long-enough'])
            ->assertStatus(422)->assertJsonValidationErrors('business');

        $this->postJson('/api/register', ['name' => 'Cy', 'email' => 'cy@example.com', 'password' => 'long-enough', 'password_confirmation' => 'long-enough', 'business' => 'Cy Builders'])
            ->assertCreated()->assertJson(['data' => ['requires_verification' => true, 'project' => 'cy-builders']]);

        $user = User::where('email', 'cy@example.com')->first();
        $this->assertSame('owner', $user->roleIn(Project::first()));
        Notifications::assertSentTo($user, VerifyEmail::class);
    }

    public function test_the_emailed_link_verifies_and_signs_in(): void
    {
        $user = $this->person('dee@example.com');
        $this->postJson('/api/email/verify', ['id' => $user->id, 'hash' => 'nope'])->assertForbidden();
        $this->postJson('/api/email/verify', ['id' => $user->id, 'hash' => sha1('dee@example.com')])
            ->assertOk()->assertJson(['message' => 'Email verified — welcome!', 'data' => ['email_verified' => true]])
            ->assertJsonStructure(['data' => ['token', 'user']]);
        $this->postJson('/api/email/verify', ['id' => $user->id, 'hash' => sha1('dee@example.com')])->assertJson(['message' => 'Email already verified.', 'data' => ['token' => null]]);

        $this->postJson('/api/email/resend', ['email' => 'nobody@example.com'])->assertOk()
            ->assertJson(['message' => 'If that address needs verifying, a new email is on its way.']);
    }

    public function test_signing_out_ends_the_token_and_presence(): void
    {
        $user = $this->verified('ed@example.com');
        $user->forceFill(['last_active_at' => now()])->save();
        $token = $user->createToken('t')->plainTextToken;
        $this->postJson('/api/logout', [], ['Authorization' => "Bearer $token"])->assertOk();
        $this->assertSame(0, $user->tokens()->count());
        $this->assertNull($user->fresh()->last_active_at);
    }

    public function test_notifications_reach_the_workspace_and_can_be_marked_read(): void
    {
        $project = Project::create(['slug' => 'p']);
        $owner = $this->person('own@example.com', $project, 'owner');
        CurrentWorkspace::run($project, fn () => (new Notifier)->notifyAdmin('GiftClaimed', 'Gift claimed', 'Ann claimed the kettle', 'gift', ['link' => '/gifts']));
        $other = Project::create(['slug' => 'q']);
        CurrentWorkspace::run($other, fn () => (new Notifier)->notifyAdmin('Note', 'Elsewhere', 'Not yours'));

        $auth = ['Authorization' => 'Bearer '.$owner->createToken('t')->plainTextToken, 'X-Workspace' => 'p'];
        $this->getJson('/api/notifications', $auth)->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Gift claimed')->assertJsonPath('data.0.link', '/gifts')->assertJsonPath('data.0.read_at', null);
        $this->postJson('/api/notifications/mark-read', [], $auth)->assertOk();
        $this->assertNotNull($this->getJson('/api/notifications', $auth)->json('data.0.read_at'));
    }
}
