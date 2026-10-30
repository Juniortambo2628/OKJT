<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Okjt\Kit\Auth\TwoFactor;

/**
 * Turning two-step verification on and off for the signed-in person:
 *
 *   POST /2fa/setup     → { secret, qr_code_svg }   (not on until confirmed)
 *   POST /2fa/confirm   { code }
 *   POST /2fa/disable
 */
class TwoFactorController extends Controller
{
    public function setup(Request $request): JsonResponse
    {
        $user = $request->user();
        $secret = TwoFactor::newSecret();
        // Stored now, switched on by confirm().
        $user->update(['two_factor_secret' => $secret]);

        return response()->json([
            'secret' => $secret,
            'qr_code_svg' => $this->qrSvg(TwoFactor::url(config('app.name', 'Dashboard'), $user->email, $secret)),
        ]);
    }

    public function confirm(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string']);
        $user = $request->user();

        if (! $user->two_factor_secret) {
            return response()->json(['message' => '2FA setup not initiated'], 422);
        }

        if (TwoFactor::verify($user->two_factor_secret, $request->code)) {
            $user->update(['two_factor_confirmed_at' => now()]);

            return response()->json([
                'message' => 'Two-factor authentication enabled successfully',
                'user' => $user->fresh(),
            ]);
        }

        return response()->json(['message' => 'Invalid verification code'], 422);
    }

    public function disable(Request $request): JsonResponse
    {
        $request->user()->update([
            'two_factor_secret' => null,
            'two_factor_confirmed_at' => null,
            'two_factor_recovery_codes' => null,
        ]);

        return response()->json(['message' => 'Two-factor authentication disabled successfully']);
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
