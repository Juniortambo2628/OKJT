<?php

namespace Okjt\Kit\Switches;

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * On/off switches: a feature built and shipped switched off, then turned on
 * from the admin when it's ready (Tena-host's Setting::getValue('…_enabled'),
 * Naoa's switched-off Phase 7, TFE's SiteSetting flags).
 *
 * A project declares its switches in okjt.switches:
 *
 *   'switches' => [
 *       'mpesa_extras' => [
 *           'label' => 'Sell extras with M-Pesa',
 *           'description' => 'Guests can pay for extras on the splash page.',
 *           'default' => env('OKJT_SWITCH_MPESA_EXTRAS', false),
 *       ],
 *   ],
 *
 * and reads one with Switches::on('mpesa_extras'). Only declared switches
 * can be flipped (SwitchController); a flipped switch is kept in
 * okjt_switches, and one nobody has flipped is at its default. Asking for a
 * switch that isn't declared answers false, so a typo leaves a feature off
 * rather than on.
 */
final class Switches
{
    private const CACHE_KEY = 'okjt.switches';

    /** Whether the switch is on. */
    public static function on(string $key): bool
    {
        $declared = self::declared();
        if (! array_key_exists($key, $declared)) {
            return false;
        }
        $flipped = self::flipped();

        return array_key_exists($key, $flipped) ? $flipped[$key] : (bool) ($declared[$key]['default'] ?? false);
    }

    /** Every declared switch: key, label, description, on, default, and whether someone flipped it. */
    public static function all(): array
    {
        $flipped = self::flipped();

        return collect(self::declared())->map(fn (array $switch, string $key) => [
            'key' => $key,
            'label' => $switch['label'] ?? ucfirst(str_replace('_', ' ', $key)),
            'description' => $switch['description'] ?? null,
            'on' => self::on($key),
            'default' => (bool) ($switch['default'] ?? false),
            'flipped' => array_key_exists($key, $flipped),
        ])->values()->all();
    }

    /** Turn a declared switch on or off. */
    public static function set(string $key, bool $on, ?int $userId = null): void
    {
        if (! array_key_exists($key, self::declared())) {
            throw new InvalidArgumentException("'{$key}' is not a declared switch (okjt.switches).");
        }
        DB::table('okjt_switches')->updateOrInsert(
            ['key' => $key],
            ['on' => $on, 'updated_by' => $userId, 'updated_at' => now(), 'created_at' => now()],
        );
        Cache::forget(self::CACHE_KEY);
    }

    /** Put a switch back to its declared default. */
    public static function reset(string $key): void
    {
        DB::table('okjt_switches')->where('key', $key)->delete();
        Cache::forget(self::CACHE_KEY);
    }

    /** The declared switches, as written in okjt.switches. */
    public static function declared(): array
    {
        return (array) config('okjt.switches', []);
    }

    /** key => on, for switches someone has flipped. Before the migration has run, none. */
    private static function flipped(): array
    {
        try {
            return Cache::rememberForever(self::CACHE_KEY, fn () => DB::table('okjt_switches')->pluck('on', 'key')
                ->map(fn ($on) => (bool) $on)->all());
        } catch (QueryException) {
            return [];
        }
    }
}
