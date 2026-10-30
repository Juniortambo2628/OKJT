<?php

namespace Okjt\Kit\Billing;

use Illuminate\Database\Eloquent\Model;

/**
 * The plans (okjt.billing.plans) and what an account may do on its own.
 * While billing is off every account is on the trial (the trial limits),
 * unless the console has given it a plan by hand. Accounts carry `plan` and
 * `plan_expires_at`.
 */
class Plans
{
    public const TRIAL = 'trial';

    public static function billingEnabled(): bool
    {
        return (bool) Settings::get('enabled');
    }

    /** @return array<string, array> */
    public static function all(): array
    {
        return Settings::get('plans', []);
    }

    public static function get(?string $key): ?array
    {
        if ($key === self::TRIAL) {
            return ['name' => 'Trial', 'for' => [], 'price' => null, 'period' => null, 'limits' => Settings::get('trial_limits', [])];
        }

        return self::all()[$key] ?? null;
    }

    /** Can $account buy $key? (billing on, priced, and — where the plan says who it's for — meant for the account's type) */
    public static function purchasable(string $key, Model $account): bool
    {
        $plan = self::all()[$key] ?? null;

        return self::billingEnabled() && $plan && $plan['price'] !== null
            && (empty($plan['for']) || in_array($account->type, $plan['for'], true));
    }

    /**
     * The plan the account is on right now: its paid (or given) plan, or the
     * default once that ran out. While billing is off the default is the trial.
     */
    public static function current(Model $account): string
    {
        $free = Settings::get('default_plan', 'free');
        $default = self::billingEnabled() ? $free : self::TRIAL;
        $plan = $account->plan ?: $default;
        if ($plan !== $default && $account->plan_expires_at && $account->plan_expires_at->isPast()) {
            return $default;
        }
        // While billing is off only a plan given by hand lifts the trial; the free plan doesn't.
        if (! self::billingEnabled() && $plan === $free) {
            return self::TRIAL;
        }

        return self::get($plan) ? $plan : $default;
    }

    /** null = unlimited */
    public static function limit(Model $account, string $limit): ?int
    {
        return self::get(self::current($account))['limits'][$limit] ?? null;
    }

    /** For a pricing page and the billing page. */
    public static function catalogue(): array
    {
        return collect(self::all())->map(fn (array $plan, string $key) => [
            'id' => $key,
            'name' => $plan['name'],
            'for' => $plan['for'] ?? [],
            'price' => $plan['price'],
            'currency' => Settings::get('currency'),
            'period' => $plan['period'],
            'limits' => $plan['limits'],
        ])->values()->all();
    }
}
