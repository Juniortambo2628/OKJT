<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Okjt\Kit\Auth\SignsPeopleIn;
use Okjt\Kit\Auth\VerificationLink;
use Okjt\Kit\Support\ApiResponse;

/**
 * Proving an email address. The emailed link (VerifyEmail, VerificationLink)
 * lands on the app, which posts its parts here; the signature, made with the
 * app key, is the proof, and the link expires.
 *
 *   POST /email/verify   { id, hash, expires, signature }   → signs them in
 *   POST /email/resend   { email }      (or signed in)
 */
class EmailVerificationController extends Controller
{
    use ApiResponse, SignsPeopleIn;

    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'required|integer',
            'hash' => 'required|string',
            'expires' => 'nullable|integer',
            'signature' => 'nullable|string',
        ]);

        $user = config('okjt.user_model')::find($validated['id']);
        $problem = $user ? VerificationLink::problem($user, $validated['hash'], $validated['expires'] ?? null, $validated['signature'] ?? null) : 'invalid';
        if ($problem === 'expired') {
            return response()->json(['success' => false, 'message' => 'This verification link has expired — sign in and we\'ll send a new one.', 'reason' => 'expired'], 403);
        }
        if ($problem) {
            return $this->errorResponse('This verification link is invalid.', 403);
        }

        if ($user->hasVerifiedEmail()) {
            return $this->successResponse(['token' => null] + $this->signedIn($user) + ['email_verified' => true], 'Email already verified.');
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return $this->successResponse(['token' => $this->issueToken($user)] + $this->signedIn($user) + ['email_verified' => true], 'Email verified — welcome!');
    }

    /** Resend the verification email for the signed-in user, or for an address mid-sign-up. */
    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            $request->validate(['email' => 'required|email']);
            $user = config('okjt.user_model')::where('email', $request->email)->first();
        }

        if (! $user) {
            // Same response whether or not the address exists (no account probing).
            return $this->successResponse(null, 'If that address needs verifying, a new email is on its way.');
        }

        if ($user->hasVerifiedEmail()) {
            return $this->successResponse(null, 'That email is already verified — try signing in.');
        }

        $user->sendEmailVerificationNotification();

        return $this->successResponse(null, 'Verification email sent — check your inbox.');
    }
}
