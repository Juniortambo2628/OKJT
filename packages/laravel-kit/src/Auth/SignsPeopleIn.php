<?php

namespace Okjt\Kit\Auth;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Throwable;

/**
 * Signing someone in, the same way whatever proved who they are (password,
 * emailed code, passkey, email link, Google, an invitation), and what every
 * way hands back.
 *
 * okjt.auth.mode decides how they stay signed in:
 *   'token'   a Sanctum bearer token in the answer (apps on another origin)
 *   'session' Laravel's session cookie (an app on the API's own origin): the
 *             guard's login, so its events (Login, Logout) fire and "remember
 *             me" works
 *
 * Projects override signedIn() to add what their app needs at sign-in (e.g.
 * the workspaces the person can open), once, in a trait their controllers share.
 */
trait SignsPeopleIn
{
    protected static function sessionMode(): bool
    {
        return config('okjt.auth.mode') === 'session';
    }

    /**
     * Sign $user in and say so: { token?, user, … }. In session mode there is
     * no token; the session is renewed (no fixation).
     */
    protected function signIn(Request $request, Model $user, bool $remember = false): array
    {
        if (static::sessionMode()) {
            Auth::guard(config('okjt.auth.guard', 'web'))->login($user, $remember);
            if ($request->hasSession()) {
                $request->session()->regenerate();
            }

            return $this->signedIn($user);
        }

        return ['token' => $this->issueToken($user)] + $this->signedIn($user);
    }

    /** A Sanctum token named okjt.auth.token_name. */
    protected function issueToken(Model $user): string
    {
        return $user->createToken(config('okjt.auth.token_name'))->plainTextToken;
    }

    /** Who signed in, as the app needs it: `user`, plus anything the project adds. */
    protected function signedIn(Model $user): array
    {
        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_superadmin' => (bool) $user->is_superadmin,
            ],
        ];
    }

    /**
     * The answer when a second step (two-step code) is still owed: the
     * challenge is proof the first step passed, sealed with the app key and
     * short-lived, so a code alone can never sign anyone in.
     */
    protected function twoFactorChallenge(Model $user, bool $remember = false): array
    {
        $challenge = Crypt::encryptString(json_encode([
            'id' => $user->getKey(),
            'remember' => $remember,
            'expires' => now()->addMinutes((int) config('okjt.auth.challenge_minutes', 5))->getTimestamp(),
        ]));

        return ['requires_2fa' => true, 'email' => $user->email, 'challenge' => $challenge];
    }

    /** The person a challenge was issued to (and whether to remember them), or null if it's forged or stale. */
    protected function challengedUser(?string $challenge): ?array
    {
        if (! $challenge) {
            return null;
        }
        try {
            $data = json_decode(Crypt::decryptString($challenge), true);
        } catch (Throwable) {
            return null;
        }
        if (! is_array($data) || ($data['expires'] ?? 0) < now()->getTimestamp()) {
            return null;
        }
        $user = config('okjt.user_model')::find($data['id'] ?? null);

        return $user ? ['user' => $user, 'remember' => (bool) ($data['remember'] ?? false)] : null;
    }

    /** Signed in, or the two-step challenge if they have it on. */
    protected function signInOrChallenge(Request $request, Model $user, bool $remember = false): array
    {
        return $user->two_factor_confirmed_at !== null
            ? $this->twoFactorChallenge($user, $remember)
            : $this->signIn($request, $user, $remember);
    }
}
