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
            ['key' => 'bg_about_experience', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_about_lawyers_hub', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_about_values', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_about_team', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_about_cta', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            // Services Page Categories
            ['key' => 'bg_services_web_development', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_services_ui_ux_design', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_services_digital_strategy', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_services_energy', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_services_fintech', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_services_diplomacy', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            // Client Impact
            ['key' => 'bg_client_impact_intro', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_client_impact_testimonials', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_client_impact_clients', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            // Contact
            ['key' => 'bg_contact_form', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_contact_info', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            // Insights
            ['key' => 'bg_insights_featured', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_insights_grid', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_insight_content', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'bg_insight_related', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            // Projects
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

        $pageHeroMedia = [
            ['key' => 'hero_home_video_1', 'value' => '', 'type' => 'video', 'group' => 'hero-media'],
            ['key' => 'hero_home_video_2', 'value' => '', 'type' => 'video', 'group' => 'hero-media'],
            ['key' => 'hero_home_video_3', 'value' => '', 'type' => 'video', 'group' => 'hero-media'],
            ['key' => 'hero_about_media', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'hero_products_media', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'hero_services_media', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'hero_insights_media', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'hero_projects_media', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'hero_client_impact_media', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'hero_contact_media', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'hero_consultation_media', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'stats_background', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'hero_pillar_web_development', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'hero_pillar_ui_ux_design', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
            ['key' => 'hero_pillar_digital_strategy', 'value' => '', 'type' => 'media', 'group' => 'hero-media'],
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

        foreach ($pageHeroMedia as $setting) {
            SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
