<?php

namespace App\Support;

use App\Models\SiteSetting;
use Illuminate\Support\Facades\Cache;

/**
 * Settings left from the site's earlier versions that nothing reads any more
 * (checked against the site, the dashboard and the server in November 2026).
 * Removed by the 2026_11_23_000003 migration, and again after seeding, so a
 * fresh install doesn't bring them back.
 */
class RetiredSettings
{
    public const KEYS = [
        // The old About page (it now reads only its hero picture).
        'about_credentials', 'about_credentials_title', 'about_cta_subtitle', 'about_cta_title',
        'about_experience_categories', 'about_experience_subtitle', 'about_experience_title', 'about_image',
        'about_lawyers_hub_body', 'about_lawyers_hub_points', 'about_lawyers_hub_title',
        'about_mission_text1', 'about_mission_text2', 'about_mission_title', 'about_sectors',
        'about_sectors_title', 'about_tagline', 'about_team_subtitle', 'about_team_title',
        // Favicons are fixed files; the "no background" logo was never shown.
        'dashboard_favicon', 'favicon', 'logo_nobg',
        // The old Contact page's title, subtitle and map.
        'contact_map_url', 'contact_subtitle', 'contact_title',
        // The site name, a third hero clip and a navigation list that were never read.
        'hero_home_video_3', 'main_nav_links', 'site_name',
        // Pictures for sections and pages the site no longer has.
        'bg_about_cta', 'bg_about_experience', 'bg_about_lawyers_hub', 'bg_client_impact_case_studies',
        'bg_client_impact_clients', 'bg_client_impact_intro', 'bg_contact_info', 'bg_contact_offices',
        'bg_insight_content', 'bg_insight_related', 'bg_insights_featured', 'bg_insights_grid',
        'bg_projects_featured', 'bg_projects_grid', 'bg_services_diplomacy', 'bg_services_energy',
        'bg_services_fintech', 'bg_services_ui_ux', 'hero_consultation_media',
        'hero_pillar_digital_strategy', 'hero_pillar_ui_ux_design', 'hero_pillar_web_development',
        'stats_background',
        // The old home page's sections (pillars, stats, projects, testimonials).
        'hero_subtitle', 'projects_tagline', 'projects_title', 'services_tagline', 'stats_section_tagline',
        'stats_section_title', 'stats_tagline', 'stats_title', 'testimonials_tagline', 'testimonials_title',
        'vp_pillar1_description', 'vp_pillar1_image', 'vp_pillar1_tag', 'vp_pillar1_title',
        'vp_pillar2_description', 'vp_pillar2_image', 'vp_pillar2_tag', 'vp_pillar2_title',
        'vp_pillar3_description', 'vp_pillar3_image', 'vp_pillar3_tag', 'vp_pillar3_title',
        // The home Insights section has no background.
        'bg_home_insights',
        // Service videos from the old Services page.
        'services_video_all', 'services_video_electronics', 'services_video_innovation',
        'services_video_software',
        // The old assistant widget.
        'nissi_assistant_enabled', 'nissi_assistant_id',
    ];

    /** Delete them; returns how many rows went. */
    public static function remove(): int
    {
        $count = SiteSetting::whereIn('key', self::KEYS)->delete();
        Cache::forget('site_settings_grouped');

        return $count;
    }
}
