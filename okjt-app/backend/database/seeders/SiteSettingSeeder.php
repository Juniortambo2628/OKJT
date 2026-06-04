<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            ['key' => 'site_name', 'value' => 'OKJTech', 'type' => 'text', 'group' => 'general'],
            ['key' => 'logo_light', 'value' => '/logos/OKJT-Logos/OKJTechLogo-Black_Transparent.png', 'type' => 'image', 'group' => 'branding'],
            ['key' => 'logo_dark', 'value' => '/logos/OKJT-Logos/OKJTechLogo-White_Transparent.png', 'type' => 'image', 'group' => 'branding'],
            ['key' => 'logo_nobg', 'value' => '/logos/OKJT-Logos/OKJTStyle_NoBG.png', 'type' => 'image', 'group' => 'branding'],
            ['key' => 'favicon', 'value' => '/logos/OKJT-Logos/OKJTechLogo-Black_BG-favicon.png', 'type' => 'image', 'group' => 'branding'],
            ['key' => 'dashboard_favicon', 'value' => '/logos/OKJT-Logos/OKJTechLogo-Black_BG-favicon.png', 'type' => 'image', 'group' => 'branding'],
            ['key' => 'hero_title', 'value' => 'Design-led Web Engineering', 'type' => 'text', 'group' => 'homepage'],
            
            // About Page
            ['key' => 'about_title', 'value' => 'Engineering the Digital Future', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_tagline', 'value' => 'Our Mission & Vision', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_story', 'value' => 'OKJTech was founded on the principle that premium digital engineering should be accessible, high-performing, and rigorously architected. We build stunning web platforms connecting ambitious businesses with their target audience through exceptional UI/UX.', 'type' => 'textarea', 'group' => 'about'],
            ['key' => 'about_image', 'value' => '/assets/images/full-stack.png', 'type' => 'image', 'group' => 'about'],

            // Contact Page
            ['key' => 'contact_email', 'value' => 'info@okjtech.co.ke', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'contact_phone', 'value' => '+254 700 000000', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'contact_address', 'value' => 'Nairobi, Kenya', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'contact_map_url', 'value' => 'https://www.google.com/maps/embed?...', 'type' => 'text', 'group' => 'contact'],

            // Social Media
            ['key' => 'social_linkedin', 'value' => 'https://linkedin.com/company/okjtech', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'social_twitter', 'value' => 'https://twitter.com/okjtech', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'social_github', 'value' => 'https://github.com/okjtech', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'social_facebook', 'value' => 'https://facebook.com/okjtech', 'type' => 'text', 'group' => 'contact'],

            // Widgets
            ['key' => 'okjt_assistant_enabled', 'value' => '0', 'type' => 'boolean', 'group' => 'widgets'],
            ['key' => 'okjt_assistant_id', 'value' => '', 'type' => 'text', 'group' => 'widgets'],
            ['key' => 'whatsapp_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'widgets'],
            ['key' => 'whatsapp_number', 'value' => '+254700000000', 'type' => 'text', 'group' => 'widgets'],
            ['key' => 'whatsapp_message', 'value' => 'Hello, I have a question about OKJTech services.', 'type' => 'text', 'group' => 'widgets'],

            // Maintenance Mode
            ['key' => 'maintenance_active', 'value' => '0', 'type' => 'boolean', 'group' => 'maintenance'],
            ['key' => 'maintenance_title', 'value' => 'System Maintenance', 'type' => 'text', 'group' => 'maintenance'],
            ['key' => 'maintenance_description', 'value' => 'OKJTech is currently undergoing scheduled maintenance to improve our services. We will be back online shortly. Thank you for your patience.', 'type' => 'textarea', 'group' => 'maintenance'],
            ['key' => 'maintenance_estimated_back', 'value' => '2026-06-01 09:00:00', 'type' => 'text', 'group' => 'maintenance'],

            // Pillar Heros
            ['key' => 'hero_pillar_web_engineering', 'value' => '/assets/images/custom-webdev.png', 'type' => 'image', 'group' => 'hero-media'],
            ['key' => 'hero_pillar_ui_ux_design', 'value' => '/assets/images/uiux-design.png', 'type' => 'image', 'group' => 'hero-media'],
            ['key' => 'hero_pillar_digital_strategy', 'value' => '/assets/images/digital-strategy.png', 'type' => 'image', 'group' => 'hero-media'],
        ];

        // Delete legacy launch settings
        \App\Models\SiteSetting::where('group', 'launch')->delete();
        \App\Models\SiteSetting::where('key', 'like', 'rsvp_%')->delete();

        foreach ($settings as $setting) {
            \App\Models\SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
