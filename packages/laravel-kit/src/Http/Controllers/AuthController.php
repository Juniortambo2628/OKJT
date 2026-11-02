<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Okjt\Kit\Auth\SignsPeopleIn;
use Okjt\Kit\Auth\TwoFactor;
use Okjt\Kit\Support\ApiResponse;
use Okjt\Kit\Support\Messages;

/**
 * Signing in with an email and password (then a code, if two-step
 * verification is on), signing up, signing out, and who you are. In token
 * mode the answer carries a Sanctum token; in session mode the session
 * cookie signs them in (okjt.auth.mode, see SignsPeopleIn).
 *
 *   POST /login        { email, password, remember? } → signed in, or
 *                       requires_verification, or requires_2fa + challenge
 *   POST /verify-2fa   { challenge, code }    → signed in (code: the app's, or a recovery code)
 *   POST /register     { name, email, password, password_confirmation, … }
 *   POST /logout                              (signed in)
 *   GET  /user                                (signed in)
 *
 * Wrong passwords are throttled per email and address
 * (okjt.auth.throttle), and the Failed, Lockout and Registered events fire.
 *
 * Projects add sign-up fields (registrationRules, or replace the defaults
 * with baseRegistrationRules), what sign-up creates (registered), and what
 * signing in hands back (signedIn, see SignsPeopleIn).
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

        $key = $this->throttleKey($request);
        $attempts = (int) config('okjt.auth.throttle.attempts', 5);
        if (RateLimiter::tooManyAttempts($key, $attempts)) {
            event(new Lockout($request));
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'email' => [trans('auth.throttle', ['seconds' => $seconds, 'minutes' => (int) ceil($seconds / 60)])],
            ]);
        }

        $user = config('okjt.user_model')::where('email', $request->email)->first();
        if (! $user || ! Hash::check($request->password, $user->password)) {
            RateLimiter::hit($key, (int) config('okjt.auth.throttle.decay_seconds', 60));
            event(new Failed(config('okjt.auth.guard', 'web'), $user, $request->only('email', 'password')));
            throw ValidationException::withMessages([
                'email' => [Messages::get('bad_credentials')],
            ]);
        }
        RateLimiter::clear($key);

        if (config('okjt.auth.verified_to_sign_in', true) && ! $user->hasVerifiedEmail()) {
            return $this->successResponse([
                'requires_verification' => true,
                'email' => $user->email,
            ], 'Please verify your email before signing in.');
        }

        return $this->successResponse($this->signInOrChallenge($request, $user, $request->boolean('remember')));
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate($this->baseRegistrationRules() + $this->registrationRules());

        $user = config('okjt.user_model')::create($this->newUserAttributes($validated));
        $extra = $this->registered($user, $validated);

        event(new Registered($user));
        // The framework's own listener sends it where it's registered: never twice.
        if (! $this->verificationSentByEvent()) {
            $user->sendEmailVerificationNotification();
        }

        return $this->createdResponse([
            'requires_verification' => true,
            'email' => $user->email,
        ] + $extra, config('okjt.auth.welcome'));
    }

    public function verify2fa(Request $request): JsonResponse
    {
        $request->validate([
            'challenge' => 'required|string',
            'code' => 'required|string',
        ]);

        $challenged = $this->challengedUser($request->challenge);
        if (! $challenged) {
            return $this->errorResponse('This sign-in has expired. Please start again.', 422);
        }

        $key = 'okjt-2fa:'.$challenged['user']->getKey().'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return $this->errorResponse('Too many attempts. Please wait a minute.', 429);
        }

        if (! TwoFactor::check($challenged['user'], $request->code)) {
            RateLimiter::hit($key, 60);

            return $this->errorResponse('Invalid 2FA code', 422);
        }
        RateLimiter::clear($key);

        return $this->successResponse($this->signIn($request, $challenged['user'], $challenged['remember']));
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->leavePresence($user);

        if (static::sessionMode()) {
            Auth::guard(config('okjt.auth.guard', 'web'))->logout();
            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }
        } else {
            $user?->currentAccessToken()?->delete();
        }

        return $this->successResponse(null, 'Logged out successfully');
    }

    public function user(Request $request): JsonResponse
    {
        return $this->successResponse($this->currentUser($request->user()));
    }

    /** Drop out of other collaborators' "who's here" right away (where the users table has presence). */
    protected function leavePresence(?Model $user): void
    {
        if ($user && Schema::hasColumn($user->getTable(), 'last_active_at')) {
            $user->forceFill(['last_active_at' => null, 'current_module' => null, 'current_path' => null])->saveQuietly();
        }
    }

    protected function throttleKey(Request $request): string
    {
        return 'okjt-login:'.Str::transliterate(Str::lower((string) $request->input('email'))).'|'.$request->ip();
    }

    protected function verificationSentByEvent(): bool
    {
        return collect(Event::getRawListeners()[Registered::class] ?? [])
            ->contains(fn ($listener) => is_string($listener) && str_starts_with($listener, SendEmailVerificationNotification::class));
    }

    // ---- What a project changes ---------------------------------------------

    /** The sign-up fields every project has; replace them for a different form (e.g. first and last name). */
    protected function baseRegistrationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ];
    }

    /** Sign-up fields beyond those (e.g. accept_terms, a business name). */
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
