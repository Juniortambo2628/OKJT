<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $settings = [
            // About Page
            ['key' => 'bg_about_mission', 'value' => '/assets/videos/services/energy-advisory.mp4', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_about_values', 'value' => '/assets/videos/services/fintech-video.mp4', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_about_team', 'value' => '/assets/videos/services/all-services-video.mp4', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_about_cta', 'value' => '/assets/videos/services/international-diplomacy-video.mp4', 'type' => 'media', 'group' => 'hero-media'],
            
            // Services Page (Categories)
            ['key' => 'bg_services_web_development', 'value' => '/assets/videos/services/all-services-video.mp4', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_services_ui_ux', 'value' => '/assets/videos/services/fintech-video.mp4', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_services_digital_strategy', 'value' => '/assets/videos/services/international-diplomacy-video.mp4', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_services_energy', 'value' => '/assets/videos/services/energy-advisory.mp4', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_services_fintech', 'value' => '/assets/videos/services/fintech-video.mp4', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_services_diplomacy', 'value' => '/assets/videos/services/international-diplomacy-video.mp4', 'type' => 'media', 'group' => 'hero-media'],
            
            // Client Impact
            ['key' => 'bg_client_impact_intro', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_client_impact_testimonials', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_client_impact_case_studies', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            
            // Contact
            ['key' => 'bg_contact_form', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_contact_offices', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            
            // Insights & Projects
            ['key' => 'bg_insights_featured', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_insights_grid', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_projects_featured', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_projects_grid', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
        ];

        foreach ($settings as $setting) {
            DB::table('site_settings')->updateOrInsert(
                ['key' => $setting['key']],
                [
                    'value' => $setting['value'],
                    'type' => $setting['type'],
                    'group' => $setting['group'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    public function down(): void
    {
        $keys = [
            'bg_about_mission', 'bg_about_values', 'bg_about_team', 'bg_about_cta',
            'bg_services_web_development', 'bg_services_ui_ux', 'bg_services_digital_strategy',
            'bg_services_energy', 'bg_services_fintech', 'bg_services_diplomacy',
            'bg_client_impact_intro', 'bg_client_impact_testimonials', 'bg_client_impact_case_studies',
            'bg_contact_form', 'bg_contact_offices',
            'bg_insights_featured', 'bg_insights_grid',
            'bg_projects_featured', 'bg_projects_grid'
        ];

        DB::table('site_settings')->whereIn('key', $keys)->delete();
    }
};
