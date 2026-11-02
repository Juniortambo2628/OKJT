<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Okjt\Kit\Auth\LoginCode;
use Okjt\Kit\Auth\LoginCodeNotification;
use Okjt\Kit\Auth\SignsPeopleIn;
use Okjt\Kit\Support\ApiResponse;

/**
 * Signing in with a code sent by email (no password):
 *
 *   POST /login-code          { email }        → the same answer whether or not the address exists
 *   POST /login-code/verify   { email, code }  → signed in, or requires_2fa + challenge
 *
 * Only the code's hash is kept; it works once, for
 * okjt.auth.login_codes.minutes. Asking is throttled on the route (the
 * project's); checking is throttled here, per email and address.
 */
class LoginCodeController extends Controller
{
    use ApiResponse, SignsPeopleIn;

    public function request(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => 'required|email|max:255']);

        $user = config('okjt.user_model')::where('email', $data['email'])->first();
        if ($user) {
            $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            LoginCode::create([
                'user_id' => $user->getKey(),
                'code_hash' => Hash::make($code),
                'expires_at' => now()->addMinutes((int) config('okjt.auth.login_codes.minutes', 10)),
                'requested_ip' => $request->ip(),
            ]);
            $notification = config('okjt.auth.login_codes.notification', LoginCodeNotification::class);
            $user->notify(new $notification($code));
        }

        return $this->successResponse(['email' => $data['email']], 'If that address exists, a sign-in code is on its way.');
    }

    public function verify(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => 'required|email', 'code' => 'required|string']);

        $key = 'okjt-login-code:'.Str::lower($data['email']).'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, (int) config('okjt.auth.login_codes.verify_attempts', 6))) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'code' => [trans('auth.throttle', ['seconds' => $seconds, 'minutes' => (int) ceil($seconds / 60)])],
            ]);
        }

        $user = config('okjt.user_model')::where('email', $data['email'])->first();
        $loginCode = $user ? LoginCode::where('user_id', $user->getKey())->whereNull('used_at')->latest('id')->first() : null;

        if (! $user || ! $loginCode || ! $loginCode->isUsable() || ! Hash::check(trim($data['code']), $loginCode->code_hash)) {
            RateLimiter::hit($key, (int) config('okjt.auth.login_codes.verify_window', 900));
            throw ValidationException::withMessages(['code' => ['That sign-in code is invalid or expired.']]);
        }

        RateLimiter::clear($key);
        $loginCode->forceFill(['used_at' => now()])->save();

        return $this->successResponse($this->signInOrChallenge($request, $user));
    }
}
