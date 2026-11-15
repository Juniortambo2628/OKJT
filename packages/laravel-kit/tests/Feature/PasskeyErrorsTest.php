<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Log;
use Laravel\Passkeys\Actions\VerifyPasskey;
use Laravel\Passkeys\Exceptions\InvalidPasskeyException;
use Laravel\Passkeys\Http\Requests\PasskeyVerificationRequest;
use Laravel\Passkeys\Passkey;
use Laravel\Passkeys\Contracts\PasskeyUser;
use Mockery;
use Okjt\Kit\Http\Controllers\PasskeyController;
use Okjt\Kit\Tests\TestCase;
use Webauthn\PublicKeyCredential;
use Webauthn\PublicKeyCredentialRequestOptions;

/** A verification request that carries a stand-in credential, so no browser is needed. */
class FakePasskeyVerificationRequest extends PasskeyVerificationRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [];
    }

    protected function passedValidation(): void {}

    public function credential(): PublicKeyCredential
    {
        return Mockery::mock(PublicKeyCredential::class);
    }

    public function verificationOptions(): PublicKeyCredentialRequestOptions
    {
        return PublicKeyCredentialRequestOptions::create(random_bytes(32));
    }
}

/** VerifyPasskey that fails the way the test says. */
class FailingVerifyPasskey extends VerifyPasskey
{
    public static ?\Throwable $failure = null;

    public function __invoke(PublicKeyCredential $credential, PublicKeyCredentialRequestOptions $options, ?PasskeyUser $user = null): Passkey
    {
        throw static::$failure;
    }
}

class PasskeyErrorsTest extends TestCase
{
    protected function defineRoutes($router): void
    {
        $router->middleware('web')->post('/passkeys/login', [PasskeyController::class, 'login']);
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->app->bind(PasskeyVerificationRequest::class, FakePasskeyVerificationRequest::class);
        $this->app->bind(VerifyPasskey::class, FailingVerifyPasskey::class);
    }

    public function test_a_passkey_that_no_longer_decrypts_answers_422_and_logs_why(): void
    {
        FailingVerifyPasskey::$failure = new DecryptException('The MAC is invalid.');
        Log::spy();

        $this->postJson('/passkeys/login', ['credential' => '{}'])
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', config('okjt.messages.passkey_failed'))
            ->assertJsonPath('errors.credential.0', config('okjt.messages.passkey_failed'));

        Log::shouldHaveReceived('error')->once()->withArgs(
            fn ($message, $context) => $message === 'Passkey sign-in failed'
                && $context['exception'] === DecryptException::class
                && $context['message'] === 'The MAC is invalid.'
        );
    }

    public function test_a_published_config_without_the_message_still_gets_words(): void
    {
        FailingVerifyPasskey::$failure = new \RuntimeException('database gone');
        config(['okjt.messages' => ['bad_credentials' => 'x']]);

        $this->postJson('/passkeys/login', ['credential' => '{}'])
            ->assertStatus(422)
            ->assertJsonPath('message', 'This passkey couldn’t be used. Sign in another way, then add the passkey again from your account.');
    }

    public function test_a_wrong_passkey_is_still_the_package_s_own_answer(): void
    {
        FailingVerifyPasskey::$failure = InvalidPasskeyException::make('Unable to verify passkey. Please try again.');
        Log::spy();

        $this->postJson('/passkeys/login', ['credential' => '{}'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['credential' => 'Unable to verify passkey. Please try again.']);

        Log::shouldNotHaveReceived('error');
    }
}
