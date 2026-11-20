<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Item 3 of okjt-app/GROWTH_PLAN.md: positioning and trust.
 *
 * - The home page's headline says who the studio builds for: African
 *   markets. Each line changes only while it still holds the old words.
 * - starting_price (Services): "$2,000", shown on the Services and How we
 *   work pages; empty hides it.
 * - Three case studies get the figure Kevin can stand behind (his CV of
 *   November 2026, and his own Naoa numbers), only where none is set.
 */
return new class extends Migration
{
    /** key => [old value, new value] */
    public const HERO = [
        'hero_tagline' => ['Tell your stories with confidence', 'Product engineering for African markets'],
        'hero_rotating_words' => ['Health Systems,Marketplaces,Nonprofit Portfolios,Just', 'Health Systems,Marketplaces,Fintech,Legal Tech,Event Platforms'],
        'hero_title_line2' => ['Built Different', 'Built for Africa'],
    ];

    /** slug => figure */
    public const FIGURES = [
        'naoa' => '250 guests, KSh 300,000+ in gifts',
        'nyalife-hms' => '200+ patients, 7 staff roles',
        'dickson-gongona-advocates' => '5 hours a week saved',
    ];

    public function up(): void
    {
        $now = now();
        foreach (self::HERO as $key => [$old, $new]) {
            DB::table('site_settings')->where('key', $key)->where('value', $old)->update(['value' => $new, 'updated_at' => $now]);
        }

        if (! DB::table('site_settings')->where('key', 'starting_price')->exists()) {
            DB::table('site_settings')->insert(['key' => 'starting_price', 'value' => '$2,000', 'type' => 'text', 'group' => 'services', 'created_at' => $now, 'updated_at' => $now]);
        }

        foreach (self::FIGURES as $slug => $figure) {
            DB::table('projects')->where('slug', $slug)
                ->where(fn ($q) => $q->whereNull('significant_figure')->orWhere('significant_figure', ''))
                ->update(['significant_figure' => $figure, 'updated_at' => $now]);
        }

        foreach (['site_settings_grouped', 'projects_all', 'projects_client', 'projects_flagship', 'sitemap.xml'] as $cacheKey) {
            Cache::forget($cacheKey);
        }
    }

    public function down(): void
    {
        foreach (self::HERO as $key => [$old, $new]) {
            DB::table('site_settings')->where('key', $key)->where('value', $new)->update(['value' => $old]);
        }
    }
};
