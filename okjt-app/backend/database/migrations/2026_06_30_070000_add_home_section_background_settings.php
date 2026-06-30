<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $settings = [
            ['key' => 'bg_home_value_proposition', 'value' => '/assets/videos/services/all-services-video.mp4', 'group' => 'section_backgrounds'],
            ['key' => 'bg_home_stats', 'value' => '/assets/videos/services/all-services-video.mp4', 'group' => 'section_backgrounds'],
            ['key' => 'bg_home_services', 'value' => '/assets/videos/services/all-services-video.mp4', 'group' => 'section_backgrounds'],
            ['key' => 'bg_home_insights', 'value' => '/assets/videos/services/all-services-video.mp4', 'group' => 'section_backgrounds'],
            ['key' => 'bg_home_cta', 'value' => '/assets/videos/services/all-services-video.mp4', 'group' => 'section_backgrounds'],
        ];

        foreach ($settings as $setting) {
            DB::table('site_settings')->updateOrInsert(
                ['key' => $setting['key']],
                $setting
            );
        }
    }

    public function down(): void
    {
        DB::table('site_settings')->whereIn('key', [
            'bg_home_value_proposition',
            'bg_home_stats',
            'bg_home_services',
            'bg_home_insights',
            'bg_home_cta',
        ])->delete();
    }
};
