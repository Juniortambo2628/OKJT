<?php

namespace Okjt\Kit\Billing;

/**
 * Where billing's settings live: okjt.billing, or for a project that keeps
 * them in its own config file, the keys it names in okjt.billing.settings_from
 * (plans and prices; anything missing there comes from okjt.billing) and
 * paystack_from (the Paystack keys).
 */
final class Settings
{
    /** From the project's own file where it has the setting, else from okjt.billing. */
    public static function get(string $key, mixed $default = null): mixed
    {
        $from = config('okjt.billing.settings_from');
        if ($from && config()->has("$from.$key")) {
            return config("$from.$key");
        }

        return config("okjt.billing.$key", $default);
    }

    public static function paystack(string $key): mixed
    {
        return config((config('okjt.billing.paystack_from') ?: 'okjt.billing.paystack').'.'.$key);
    }
}
