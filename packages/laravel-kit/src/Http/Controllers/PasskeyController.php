<?php

namespace Okjt\Kit\Http\Controllers;

use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Laravel\Passkeys\Actions\DeletePasskey;
use Laravel\Passkeys\Actions\GenerateRegistrationOptions;
use Laravel\Passkeys\Actions\GenerateVerificationOptions;
use Laravel\Passkeys\Actions\StorePasskey;
use Laravel\Passkeys\Actions\VerifyPasskey;
use Laravel\Passkeys\Exceptions\InvalidPasskeyException;
use Laravel\Passkeys\Http\Requests\PasskeyRegistrationRequest;
use Laravel\Passkeys\Http\Requests\PasskeyVerificationRequest;
use Laravel\Passkeys\Passkeys;
use Laravel\Passkeys\Support\WebAuthn;
use Okjt\Kit\Auth\SignsPeopleIn;
use Okjt\Kit\Support\ApiResponse;
use Okjt\Kit\Support\Messages;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

/**
 * Passkeys (needs laravel/passkeys) on the kit's bearer tokens; the package's
 * own routes assume a session guard. The challenges ride the session, so the
 * routes go in routes/web.php; a passkey sign-in issues the same token a
 * password does.
 *
 *   GET    /passkeys/login/options              → options
 *   POST   /passkeys/login                      → signed in, or requires_verification / requires_2fa + challenge
 *   GET    /passkeys/options      (signed in)   → options for a new passkey
 *   POST   /passkeys              (signed in)   { name, credential }
 *   GET    /passkeys              (signed in)   → your passkeys
 *   DELETE /passkeys/{id}         (signed in)
 *
 * A passkey that fails for a reason the package doesn't expect (a stored key
 * that no longer decrypts after an APP_KEY change, a database error) answers
 * 422 with okjt.messages.passkey_failed, and the real cause goes to the log.
 * Without this it was a bare 500 with nothing logged and nothing to show.
 */
class PasskeyController extends Controller
{
    use ApiResponse, SignsPeopleIn;

    public function loginOptions(Request $request, GenerateVerificationOptions $generate): JsonResponse
    {
        $options = $generate();
        $request->session()->put('passkey.verification_options', WebAuthn::toJson($options));

        return $this->successResponse(['options' => WebAuthn::toBrowserArray($options)]);
    }

    public function login(PasskeyVerificationRequest $request, VerifyPasskey $verify): JsonResponse
    {
        return $this->guarded('sign-in', fn () => $this->signInWith($request, $verify));
    }

    protected function signInWith(PasskeyVerificationRequest $request, VerifyPasskey $verify): JsonResponse
    {
        $passkey = $verify($request->credential(), $request->verificationOptions());

        if (! Passkeys::allowsLogin($request, $passkey)) {
            throw InvalidPasskeyException::make('Unable to sign in with this account.');
        }

        $user = $passkey->user;

        if (! $user->hasVerifiedEmail()) {
            return $this->successResponse([
                'requires_verification' => true,
                'email' => $user->email,
            ], 'Please verify your email before signing in.');
        }

        return $this->successResponse($this->signInOrChallenge($request, $user));
    }

    public function registerOptions(Request $request, GenerateRegistrationOptions $generate): JsonResponse
    {
        $user = $request->user() ?? abort(401);

        $options = $generate($user);
        $request->session()->put('passkey.registration_options', WebAuthn::toJson($options));

        return $this->successResponse(['options' => WebAuthn::toBrowserArray($options)]);
    }

    public function register(PasskeyRegistrationRequest $request, StorePasskey $store): JsonResponse
    {
        $user = $request->user() ?? abort(401);

        return $this->guarded('registration', fn () => $this->store($request, $store, $user));
    }

    protected function store(PasskeyRegistrationRequest $request, StorePasskey $store, $user): JsonResponse
    {
        $passkey = $store(
            $user,
            $request->string('name')->toString() ?: 'Passkey',
            $request->credential(),
            $request->registrationOptions(),
        );

        return $this->createdResponse([
            'id' => $passkey->id,
            'name' => $passkey->name,
        ], 'Passkey added');
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user() ?? abort(401);

        return $this->successResponse(
            $user->passkeys()->orderBy('created_at')->get(['id', 'name', 'created_at', 'last_used_at'])
        );
    }

    public function destroy(Request $request, int $id, DeletePasskey $delete): JsonResponse
    {
        $user = $request->user() ?? abort(401);

        $passkey = $user->passkeys()->findOrFail($id);
        $delete($user, $passkey);

        return $this->deletedResponse('Passkey removed');
    }

    /**
     * Run a passkey step, turning an unexpected failure into a 422 the app can
     * show. Validation (a wrong or unknown passkey), HTTP errors and missing
     * sign-in pass through as they are.
     */
    protected function guarded(string $step, Closure $run): JsonResponse
    {
        try {
            return $run();
        } catch (ValidationException|HttpExceptionInterface|AuthenticationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error("Passkey {$step} failed", [
                'exception' => $e::class,
                'message' => $e->getMessage(),
                'file' => $e->getFile().':'.$e->getLine(),
            ]);

            // A project whose published config predates this message still gets words.
            $message = Messages::get('passkey_failed')
                ?: 'This passkey couldn’t be used. Sign in another way, then add the passkey again from your account.';

            return $this->errorResponse($message, 422, ['credential' => [$message]]);
        }
    }
}
