<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
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

/**
 * Passkeys (needs laravel/passkeys) on the kit's bearer tokens; the package's
 * own routes assume a session guard. The challenges ride the session, so the
 * routes go in routes/web.php; a passkey sign-in issues the same token a
 * password does.
 *
 *   GET    /passkeys/login/options              → options
 *   POST   /passkeys/login                      → token, or requires_verification / requires_2fa
 *   GET    /passkeys/options      (signed in)   → options for a new passkey
 *   POST   /passkeys              (signed in)   { name, credential }
 *   GET    /passkeys              (signed in)   → your passkeys
 *   DELETE /passkeys/{id}         (signed in)
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

        if ($user->two_factor_confirmed_at !== null) {
            return $this->successResponse([
                'requires_2fa' => true,
                'email' => $user->email,
            ]);
        }

        return $this->successResponse(['token' => $this->issueToken($user)] + $this->signedIn($user));
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
}
