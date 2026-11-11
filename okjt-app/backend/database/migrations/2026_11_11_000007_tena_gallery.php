<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Tena's gallery (2026-11-11): nine product screens from the Tena-host repo
 * (guest WiFi pages for a stay, a café and an event, the reviews dashboard,
 * a WhatsApp campaign, M-Pesa extras and event attendees, all demo data),
 * added after any pictures already in the gallery.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('projects')) {
            return;
        }

        $row = DB::table('projects')->where('slug', 'tena')->first(['id', 'gallery']);
        if (! $row) {
            return;
        }

        $existing = array_values(array_filter((array) json_decode($row->gallery ?? '[]', true), fn ($v) => is_string($v) && trim($v) !== ''));
        $shots = array_map(fn ($n) => sprintf('/assets/images/work/tena/%02d.webp', $n), range(1, 9));
        DB::table('projects')->where('id', $row->id)->update([
            'gallery' => json_encode(array_values(array_unique([...$existing, ...$shots]))),
            'updated_at' => now(),
        ]);

        Cache::flush();
    }

    public function down(): void
    {
        // Pictures added to content are not removed.
    }
};
