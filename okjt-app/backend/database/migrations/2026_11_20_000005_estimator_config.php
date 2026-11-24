<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * The cost estimator's prices (/tools/estimate), editable in Settings >
 * Services > Estimator config. Empty means the page uses its built-in
 * starting figures (okjt-app/web/src/lib/estimator.js); Kevin can paste and
 * change them here without a deploy.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! DB::table('site_settings')->where('key', 'estimator_config')->exists()) {
            DB::table('site_settings')->insert(['key' => 'estimator_config', 'value' => '', 'type' => 'textarea', 'group' => 'services', 'created_at' => now(), 'updated_at' => now()]);
            Cache::forget('site_settings_grouped');
        }
    }

    public function down(): void
    {
        DB::table('site_settings')->where('key', 'estimator_config')->delete();
    }
};
