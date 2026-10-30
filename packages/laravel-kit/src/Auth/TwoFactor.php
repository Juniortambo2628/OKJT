<?php

namespace Okjt\Kit\Auth;

use PragmaRX\Google2FA\Google2FA;

/** Time-based one-time codes (authenticator apps), ±30 seconds. */
final class TwoFactor
{
    public static function newSecret(): string
    {
        return (new Google2FA)->generateSecretKey();
    }

    public static function verify(string $secret, string $code): bool
    {
        return (bool) (new Google2FA)->verifyKey($secret, $code, 1);
    }

    /** The otpauth:// URL an authenticator app scans. */
    public static function url(string $issuer, string $email, string $secret): string
    {
        return (new Google2FA)->getQRCodeUrl($issuer, $email, $secret);
    }
}
