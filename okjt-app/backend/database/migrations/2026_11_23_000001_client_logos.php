<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Client logos (2026-11-23).
 *
 * The Client Impact page's "Organisations served" grid showed each client's
 * name in text, because no logos had been uploaded. The logos now ship with
 * the app under /assets/images/clients/, taken from each client's own site
 * or the repository of the site OKJTech built, with white backgrounds
 * removed so they read as white on the dark tiles.
 *
 * A client gets its logo only where none is set, so an upload from the
 * dashboard is kept. Clients are matched by name, case-insensitively, in the
 * spellings both seeders use. Not covered yet (no logo to hand): Global
 * Harmony Initiative.
 */
return new class extends Migration
{
    private const BASE = '/assets/images/clients/';

    /** Logo file => the client names it belongs to. */
    public const LOGOS = [
        'lawyers-hub.webp' => ['Lawyers Hub'],
        'nyalife-womens-clinic.webp' => ["Nyalife Women's Clinic", 'Nyalife Clinic'],
        'south-ring-autos.webp' => ['South Ring Autos', 'SouthRing Autos'],
        'dickson-gitonga-advocates.webp' => ['Dickson, Gitonga Advocates LLP', 'Dickson Gitonga Advocates'],
        'wisdom-capital.webp' => ['Wisdom Capital'],
        'tamcon-consulting-engineers.webp' => ['TAMCON Consulting Engineers', 'TAMCON Consulting'],
        'tena.webp' => ['Tena', 'Tena Platform'],
        'omnispace-3d.svg' => ['OmniSpace 3D Events Ltd', 'OmniSpace 3D'],
        'silversky-events.svg' => ['Silversky Events'],
        'hucaa.webp' => ['HUCAA'],
        'nissi-insights.webp' => ['Nissi Insights'],
        'gm-coaching.webp' => ['GM Coaching'],
        'terik-tours.webp' => ['Terik Tours'],
        'reytati-communications.webp' => ['Reytati Communications'],
        'mizizi.webp' => ['Mizizi Sugarcane Juice', 'Mizizi Juices'],
    ];

    public function up(): void
    {
        if (! Schema::hasTable('clients')) {
            return;
        }

        $now = now();
        foreach (self::LOGOS as $file => $names) {
            DB::table('clients')
                ->whereIn(DB::raw('LOWER(name)'), array_map('mb_strtolower', $names))
                ->where(fn ($q) => $q->whereNull('logo')->orWhere('logo', ''))
                ->update(['logo' => self::BASE.$file, 'updated_at' => $now]);
        }

        Cache::flush();
    }

    public function down(): void
    {
        // Logos added to clients are not removed.
    }
};
