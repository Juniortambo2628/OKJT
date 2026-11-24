<?php

namespace Okjt\Kit\Auth;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

/**
 * Time-based one-time codes (authenticator apps), ±30 seconds, and the
 * recovery codes that stand in for a lost phone (each works once).
 *
 * With okjt.auth.two_factor.secrets_encrypted, the secret and recovery codes
 * are stored encrypted as Laravel Fortify stores them, so an app moving from
 * Fortify keeps everyone's two-step sign-in.
 */
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

    private static function encrypted(): bool
    {
        return (bool) config('okjt.auth.two_factor.secrets_encrypted', false);
    }

    /** The person's secret, as an authenticator app has it. */
    public static function secretOf(Model $user): ?string
    {
        $stored = $user->two_factor_secret;
        if (! $stored) {
            return null;
        }

        return self::encrypted() ? decrypt($stored) : $stored;
    }

    public static function storeSecret(Model $user, ?string $secret): void
    {
        $user->forceFill(['two_factor_secret' => $secret && self::encrypted() ? encrypt($secret) : $secret])->save();
    }

    /** @return array<int, string> */
    public static function recoveryCodesOf(Model $user): array
    {
        $stored = $user->two_factor_recovery_codes;
        if (! $stored) {
            return [];
        }

        return json_decode(self::encrypted() ? decrypt($stored) : $stored, true) ?: [];
    }

    /** Eight new recovery codes, replacing any old ones. @return array<int, string> */
    public static function newRecoveryCodes(Model $user): array
    {
        $codes = collect(range(1, 8))->map(fn () => self::recoveryCode())->all();
        self::storeRecoveryCodes($user, $codes);

        return $codes;
    }

    private static function storeRecoveryCodes(Model $user, array $codes): void
    {
        $json = json_encode(array_values($codes));
        $user->forceFill(['two_factor_recovery_codes' => self::encrypted() ? encrypt($json) : $json])->save();
    }

    private static function recoveryCode(): string
    {
        return Str::random(10).'-'.Str::random(10);
    }

    /**
     * A code from the authenticator app, or one of the recovery codes (which
     * is then used up, and replaced so there are always eight).
     */
    public static function check(Model $user, string $code): bool
    {
        $secret = self::secretOf($user);
        $code = trim($code);
        if ($secret && preg_match('/^\d{6}$/', $code) && self::verify($secret, $code)) {
            return true;
        }

        $codes = self::recoveryCodesOf($user);
        $index = array_search($code, $codes, true);
        if ($index === false) {
            return false;
        }
        $codes[$index] = self::recoveryCode();
        self::storeRecoveryCodes($user, $codes);

        return true;
    }
}
