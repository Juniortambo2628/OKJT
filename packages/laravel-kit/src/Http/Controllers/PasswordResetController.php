<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Okjt\Kit\Support\ApiResponse;

/**
 * Forgotten passwords, through Laravel's password broker:
 *
 *   POST /forgot-password   { email }  → the same answer whether or not the address exists
 *   POST /reset-password    { token, email, password, password_confirmation }
 *
 * The emailed link opens {app.frontend_url}{okjt.auth.password_reset.path}/{token}?email=…
 * (set up by the kit's service provider). A reset signs out everywhere else
 * (the remember token changes) and fires PasswordReset.
 */
class PasswordResetController extends Controller
{
    use ApiResponse;

    public function forgot(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);
        Password::sendResetLink($request->only('email'));

        // No account probing: the same answer either way.
        return $this->successResponse(null, 'If that address has an account, a reset link is on its way.');
    }

    public function reset(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();
                event(new PasswordReset($user));
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => [trans($status)]]);
        }

        return $this->successResponse(null, trans($status));
    }
}
