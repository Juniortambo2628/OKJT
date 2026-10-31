<?php

namespace Okjt\Kit\Auth;

use Illuminate\Database\Eloquent\Model;

/**
 * The emailed link that proves an address: {app}/verify-email/{id}/{hash}
 * ?expires=…&signature=…. The signature is an HMAC of the id, the hash of the
 * address and the expiry under the app key, so only the server can make one;
 * the link lasts okjt.auth.verify_minutes (a day by default).
 */
final class VerificationLink
{
    public static function for(Model $user): string
    {
        $app = rtrim(config('app.frontend_url') ?: config('app.url'), '/');
        $id = $user->getKey();
        $hash = sha1($user->getEmailForVerification());
        $expires = now()->addMinutes((int) config('okjt.auth.verify_minutes', 1440))->getTimestamp();

        return $app.'/verify-email/'.$id.'/'.$hash.'?'.http_build_query([
            'expires' => $expires,
            'signature' => self::sign($id, $hash, $expires),
        ]);
    }

    /** Why these link parts don't verify $user: 'invalid' or 'expired'; null when they do. */
    public static function problem(Model $user, string $hash, mixed $expires, mixed $signature): ?string
    {
        if (! is_numeric($expires) || ! is_string($signature)
            || ! hash_equals(sha1($user->getEmailForVerification()), $hash)
            || ! hash_equals(self::sign($user->getKey(), $hash, (int) $expires), $signature)) {
            return 'invalid';
        }

        return (int) $expires < now()->getTimestamp() ? 'expired' : null;
    }

    private static function sign(mixed $id, string $hash, int $expires): string
    {
        return hash_hmac('sha256', "{$id}|{$hash}|{$expires}", (string) config('app.key'));
    }
}
