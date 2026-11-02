<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Okjt\Kit\Auth\TwoFactor;

/**
 * Turning two-step verification on and off for the signed-in person:
 *
 *   POST /2fa/setup             → { secret, qr_code_svg }   (not on until confirmed)
 *   POST /2fa/confirm           { code } → { recovery_codes }
 *   POST /2fa/disable
 *   GET  /2fa/recovery-codes    → { recovery_codes }
 *   POST /2fa/recovery-codes    → new ones
 *
 * Projects that want the password asked again first put Laravel's
 * password.confirm middleware on these routes (see ConfirmPasswordController).
 */
class TwoFactorController extends Controller
{
    public function setup(Request $request): JsonResponse
    {
        $user = $request->user();
        $secret = TwoFactor::newSecret();
        // Stored now, switched on by confirm().
        TwoFactor::storeSecret($user, $secret);
        $user->forceFill(['two_factor_confirmed_at' => null])->save();

        return response()->json([
            'secret' => $secret,
            'qr_code_svg' => $this->qrSvg(TwoFactor::url(config('app.name', 'Dashboard'), $user->email, $secret)),
        ]);
    }

    public function confirm(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string']);
        $user = $request->user();

        $secret = TwoFactor::secretOf($user);
        if (! $secret) {
            return response()->json(['message' => '2FA setup not initiated'], 422);
        }

        if (TwoFactor::verify($secret, $request->code)) {
            $user->forceFill(['two_factor_confirmed_at' => now()])->save();

            return response()->json([
                'message' => 'Two-factor authentication enabled successfully',
                'recovery_codes' => TwoFactor::newRecoveryCodes($user),
                'user' => $user->fresh(),
            ]);
        }

        return response()->json(['message' => 'Invalid verification code'], 422);
    }

    public function disable(Request $request): JsonResponse
    {
        $request->user()->forceFill([
            'two_factor_secret' => null,
            'two_factor_confirmed_at' => null,
            'two_factor_recovery_codes' => null,
        ])->save();

        return response()->json(['message' => 'Two-factor authentication disabled successfully']);
    }

    public function recoveryCodes(Request $request): JsonResponse
    {
        return response()->json(['recovery_codes' => TwoFactor::recoveryCodesOf($request->user())]);
    }

    public function regenerateRecoveryCodes(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->two_factor_confirmed_at === null) {
            return response()->json(['message' => 'Two-factor authentication is not on'], 422);
        }

        return response()->json(['recovery_codes' => TwoFactor::newRecoveryCodes($user)]);
    }

    /** The QR code for the authenticator app, as SVG (bacon/bacon-qr-code when installed). */
    protected function qrSvg(string $url): string
    {
        if (! class_exists(\BaconQrCode\Writer::class)) {
            return '';
        }

        $renderer = new \BaconQrCode\Renderer\ImageRenderer(
            new \BaconQrCode\Renderer\RendererStyle\RendererStyle(200),
            new \BaconQrCode\Renderer\Image\SvgImageBackEnd,
        );

        return (new \BaconQrCode\Writer($renderer))->writeString($url);
    }
}
