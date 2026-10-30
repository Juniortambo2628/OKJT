<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Okjt\Kit\Auth\SignsPeopleIn;
use Okjt\Kit\Auth\TwoFactor;
use Okjt\Kit\Support\ApiResponse;

/**
 * Signing in with an email and password (then a code, if two-step
 * verification is on), signing up, signing out, and who you are. Tokens are
 * Sanctum bearer tokens.
 *
 *   POST /login        { email, password }   → token, or requires_verification / requires_2fa
 *   POST /verify-2fa   { email, code }       → token
 *   POST /register     { name, email, password, password_confirmation, … }
 *   POST /logout                             (signed in)
 *   GET  /user                               (signed in)
 *
 * Projects add sign-up fields (registrationRules), what sign-up creates
 * (registered), and what signing in hands back (signedIn, see SignsPeopleIn).
 */
class AuthController extends Controller
{
    use ApiResponse, SignsPeopleIn;

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = config('okjt.user_model')::where('email', $request->email)->first();
        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

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

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ] + $this->registrationRules());

        $user = config('okjt.user_model')::create($this->newUserAttributes($validated));
        $extra = $this->registered($user, $validated);
        $user->sendEmailVerificationNotification();

        return $this->createdResponse([
            'requires_verification' => true,
            'email' => $user->email,
        ] + $extra, config('okjt.auth.welcome'));
    }

    public function verify2fa(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
        ]);

        $user = config('okjt.user_model')::where('email', $request->email)->first();
        if (! $user || ! $user->two_factor_secret) {
            return $this->errorResponse('Invalid request', 422);
        }

        if (! TwoFactor::verify($user->two_factor_secret, $request->code)) {
            return $this->errorResponse('Invalid 2FA code', 422);
        }

        return $this->successResponse(['token' => $this->issueToken($user)] + $this->signedIn($user));
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        // Drop out of other collaborators' "who's here" right away.
        $request->user()->forceFill(['last_active_at' => null, 'current_module' => null, 'current_path' => null])->saveQuietly();

        return $this->successResponse(null, 'Logged out successfully');
    }

    public function user(Request $request): JsonResponse
    {
        return $this->successResponse($this->currentUser($request->user()));
    }

    // ---- What a project changes ---------------------------------------------

    /** Sign-up fields beyond name, email and password (e.g. accept_terms, a business name). */
    protected function registrationRules(): array
    {
        return [];
    }

    /** The new user's attributes. Sign-up makes them the owner of what they create. */
    protected function newUserAttributes(array $validated): array
    {
        return [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => config('okjt.roles.owner'),
        ];
    }

    /** After sign-up, before the verification email: create what they signed up for; return extra response data. */
    protected function registered(Model $user, array $validated): array
    {
        return [];
    }

    /** GET /user: who you are, and everything the app needs about you. */
    protected function currentUser(Model $user): array
    {
        return $this->signedIn($user)['user'] + $user->toArray();
    }
}
