<?php

namespace Okjt\Kit\Content;

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Site settings: the words, pictures and switches a site's pages read, edited
 * in the admin (@okjt/dashboard's AdminSiteSettings). Every project had its
 * own (okjt-app SiteSetting, TFE SiteSetting, Naoa Setting, Tena-host
 * Setting); this is okjt-app's shape, which TFE shares: key, value, type,
 * group, in okjt.site_settings.table (default site_settings).
 *
 *   SiteSettings::get('contact_email', 'hello@example.com');
 *   SiteSettings::group('contact');            // key => value
 *   SiteSettings::put(['contact_email' => ['value' => 'x@y.z', 'group' => 'contact']]);
 *
 * Values are text; a switch is '1' / '0' (bool() reads it). Cached until
 * the next save. Before the migration has run, every key reads its default.
 */
final class SiteSettings
{
    private const CACHE_KEY = 'okjt.site_settings';

    public static function get(string $key, mixed $default = null): mixed
    {
        $row = self::rows()[$key] ?? null;

        return $row === null || $row['value'] === null ? $default : $row['value'];
    }

    public static function bool(string $key, bool $default = false): bool
    {
        $value = self::get($key);

        return $value === null ? $default : in_array(strtolower((string) $value), ['1', 'true', 'on', 'yes'], true);
    }

    /** key => value for one group. */
    public static function group(string $group): array
    {
        return collect(self::rows())->where('group', $group)->map(fn ($row) => $row['value'])->all();
    }

    /** Every stored setting: key => [key, value, type, group]. */
    public static function all(): array
    {
        return self::rows();
    }

    /**
     * Save several at once: key => ['value' => …, 'type' => …, 'group' => …]
     * (type and group default to the stored ones, else text / general).
     */
    public static function put(array $settings): void
    {
        $table = self::table();
        $stored = self::rows();
        DB::transaction(function () use ($settings, $table, $stored) {
            foreach ($settings as $key => $item) {
                $row = [
                    'value' => $item['value'] ?? null,
                    'type' => $item['type'] ?? $stored[$key]['type'] ?? 'text',
                    'group' => $item['group'] ?? $stored[$key]['group'] ?? 'general',
                    'updated_at' => now(),
                ];
                if (DB::table($table)->where('key', $key)->exists()) {
                    DB::table($table)->where('key', $key)->update($row);
                } else {
                    DB::table($table)->insert(['key' => $key, 'created_at' => now()] + $row);
                }
            }
        });
        self::forget();
    }

    public static function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    public static function table(): string
    {
        return config('okjt.site_settings.table', 'site_settings');
    }

    private static function rows(): array
    {
        try {
            return Cache::rememberForever(self::CACHE_KEY, fn () => DB::table(self::table())->orderBy('key')->get(['key', 'value', 'type', 'group'])
                ->mapWithKeys(fn ($row) => [$row->key => (array) $row])->all());
        } catch (QueryException) {
            return [];
        }
    }
}
