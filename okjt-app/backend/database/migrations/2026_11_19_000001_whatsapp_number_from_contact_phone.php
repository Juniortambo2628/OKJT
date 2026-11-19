<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * The WhatsApp button still opened +44 7000 000000, a placeholder that
 * WidgetSettingsSeeder carried over from the Nissi Insights project. It now
 * opens the studio's own number, the contact phone shown on the Contact
 * page. A number already changed in the dashboard is left as it is.
 */
return new class extends Migration
{
    public const PLACEHOLDER = '+447000000000';

    public const NUMBER = '+254705883227';

    public function up(): void
    {
        $updated = DB::table('site_settings')
            ->where('key', 'whatsapp_number')
            ->whereIn('value', [self::PLACEHOLDER, '+44 7000 000000', '+44 70 0000 0000'])
            ->update(['value' => self::NUMBER, 'updated_at' => now()]);

        if ($updated) {
            Cache::forget('site_settings_grouped');
        }
    }

    public function down(): void
    {
        // The placeholder was never meant to be live: nothing to restore.
    }
};
