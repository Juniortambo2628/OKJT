<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Okjt\Kit\Support\ApiResponse;

/**
 * Asking for the password again before something sensitive (e.g. turning
 * two-step sign-in off), for the signed-in person:
 *
 *   POST /confirm-password            { password }
 *   GET  /confirmed-password-status   → { confirmed }
 *
 * In session mode it is remembered as Laravel's password.confirm middleware
 * reads it (auth.password_confirmed_at, for auth.password_timeout seconds).
 */
class ConfirmPasswordController extends Controller
{
    use ApiResponse;

    public function confirm(Request $request): JsonResponse
    {
        $request->validate(['password' => 'required|string']);

        if (! Hash::check($request->password, $request->user()->password)) {
            throw ValidationException::withMessages(['password' => [trans('auth.password')]]);
        }

        if ($request->hasSession()) {
            $request->session()->passwordConfirmed();
        }

        return $this->successResponse(['confirmed' => true], 'Password confirmed.');
    }

    public function status(Request $request): JsonResponse
    {
        $confirmedAt = $request->hasSession() ? (int) $request->session()->get('auth.password_confirmed_at', 0) : 0;

        return $this->successResponse(['confirmed' => time() - $confirmedAt < (int) config('auth.password_timeout', 10800)]);
    }
}
