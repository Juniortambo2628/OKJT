<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SectionBackgroundSeeder extends Seeder
{
    public function run(): void
    {
        $heroMedia = [
            // About Page
            ['key' => 'bg_about_mission', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_about_values', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_about_team', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_about_cta', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            // Services Page Categories
            ['key' => 'bg_services_web_development', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_services_ui_ux', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_services_digital_strategy', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_services_energy', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_services_fintech', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_services_diplomacy', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
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

        $sectionBackgrounds = [
            ['key' => 'bg_home_value_proposition', 'value' => '/assets/videos/services/all-services-video.mp4', 'group' => 'section_backgrounds'],
            ['key' => 'bg_home_stats', 'value' => '/assets/videos/services/all-services-video.mp4', 'group' => 'section_backgrounds'],
            ['key' => 'bg_home_services', 'value' => '/assets/videos/services/all-services-video.mp4', 'group' => 'section_backgrounds'],
            ['key' => 'bg_home_insights', 'value' => '/assets/videos/services/all-services-video.mp4', 'group' => 'section_backgrounds'],
            ['key' => 'bg_home_cta', 'value' => '/assets/videos/services/all-services-video.mp4', 'group' => 'section_backgrounds'],
        ];

        foreach ($heroMedia as $setting) {
            SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        foreach ($sectionBackgrounds as $setting) {
            SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
