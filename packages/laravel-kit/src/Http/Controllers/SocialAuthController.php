<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\User as SocialUser;
use Laravel\Socialite\Facades\Socialite;
use Okjt\Kit\Auth\SignsPeopleIn;
use Okjt\Kit\Support\ApiResponse;
use Okjt\Kit\Support\Messages;

/**
 * Signing in with Google (needs laravel/socialite). The app sends the browser
 * to the redirect route, Google comes back to the callback, and the app gets
 * a one-time code in its URL that it swaps for the usual token (a long-lived
 * token never goes in a URL).
 *
 *   GET  /auth/google            (web)  → Google
 *   GET  /auth/google/callback   (web)  → {frontend}{okjt.auth.social.return_path}?code=…
 *   POST /api/auth/google        { code } → token, or requires_2fa
 *
 * Projects add what a first sign-in creates (joined), and what signing in
 * hands back (signedIn, see SignsPeopleIn).
 */
class SocialAuthController extends Controller
{
    use ApiResponse, SignsPeopleIn;

    /** The Socialite driver. */
    protected string $provider = 'google';

    public function redirect(): RedirectResponse
    {
        return Socialite::driver($this->provider)->redirect();
    }

    /** Find or create the person, keep a one-time code for them, and send the browser back to the app. */
    public function callback(): RedirectResponse
    {
        $social = Socialite::driver($this->provider)->user();

        $user = config('okjt.user_model')::where('email', $social->getEmail())->first();

        if (! $user) {
            $user = config('okjt.user_model')::create($this->newUserAttributes($social));
            $this->joined($user, $social);
        } elseif (! $user->hasVerifiedEmail()) {
            // The provider has already proved the address.
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        $code = Str::random(40);
        Cache::put("social-login:{$code}", $user->id, now()->addMinutes(config('okjt.auth.social.code_minutes')));

        return Redirect::away($this->frontendUrl().config('okjt.auth.social.return_path').'?code='.$code);
    }

    /** Swap the one-time code for a token. */
    public function login(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string']);

        $userId = Cache::pull("social-login:{$request->code}");
        if (! $userId) {
            return $this->errorResponse(Messages::get('sign_in_expired'), 422);
        }

        $user = config('okjt.user_model')::find($userId);
        if (! $user) {
            return $this->errorResponse(Messages::get('account_not_found'), 404);
        }

        if ($user->two_factor_confirmed_at !== null) {
            return $this->successResponse([
                'requires_2fa' => true,
                'email' => $user->email,
            ]);
        }

        return $this->successResponse(['token' => $this->issueToken($user)] + $this->signedIn($user));
    }

    // ---- What a project changes ---------------------------------------------

    /** A first-time visitor's attributes: an owner, with the address already verified. */
    protected function newUserAttributes(SocialUser $social): array
    {
        return [
            'name' => $social->getName() ?: $social->getNickname() ?: config('okjt.auth.new_user_name'),
            'email' => $social->getEmail(),
            'password' => Str::password(32, true, true, true, false),
            'role' => config('okjt.roles.owner'),
            'email_verified_at' => now(),
        ];
    }

    /** After a first sign-in creates the person: create what a sign-up would (e.g. their account). */
    protected function joined(Model $user, SocialUser $social): void {}

    /** Where the app lives. */
    protected function frontendUrl(): string
    {
        return rtrim(config('app.frontend_url') ?: config('app.url'), '/');
    }
}
