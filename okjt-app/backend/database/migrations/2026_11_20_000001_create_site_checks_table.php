<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Reports of the website health check (/tools/site-check), kept for 30 days,
 * and the optional Google PageSpeed Insights key the visitor's browser uses
 * (Settings > Widgets). Without a key the speed test still runs, on Google's
 * shared allowance; a key should be restricted to okjtech.co.ke in Google
 * Cloud, since browsers see it.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_checks', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('url', 2048);
            $table->string('host')->index();
            $table->json('report');
            $table->json('speed')->nullable();
            $table->timestamps();
        });

        if (! DB::table('site_settings')->where('key', 'pagespeed_api_key')->exists()) {
            DB::table('site_settings')->insert([
                'key' => 'pagespeed_api_key', 'value' => '', 'type' => 'text', 'group' => 'widgets',
                'created_at' => now(), 'updated_at' => now(),
            ]);
            Cache::forget('site_settings_grouped');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('site_checks');
    }
};
