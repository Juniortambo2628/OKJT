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
            
            // Hero Section
            ['key' => 'hero_tagline', 'value' => 'Trusted Design-Led Software Engineering', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'hero_title_line1', 'value' => 'Engineering for', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'hero_rotating_words', 'value' => 'Scale.,Impact.,Complexity.', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'hero_title_line2', 'value' => 'Empowering Digital Growth.', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'hero_subtitle', 'value' => 'We design and build bespoke, high-performance web applications, robust cloud APIs, and seamless digital solutions for fast-growing businesses.', 'type' => 'textarea', 'group' => 'homepage'],
            
            // Three Pillars (Value Proposition) Section
            ['key' => 'vp_section_tagline', 'value' => 'What We Do', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'vp_section_title', 'value' => 'Three Pillars of Trusted Intelligence', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'vp_section_subtitle', 'value' => 'We blend architectural discipline with aesthetic mastery to create systems that grow with your ambitions.', 'type' => 'textarea', 'group' => 'homepage'],
            ['key' => 'vp_pillar1_image', 'value' => '/assets/images/custom-webdev.png', 'type' => 'image', 'group' => 'homepage'],
            ['key' => 'vp_pillar2_image', 'value' => '/assets/images/uiux-design.png', 'type' => 'image', 'group' => 'homepage'],
            ['key' => 'vp_pillar3_image', 'value' => '/assets/images/digital-strategy.png', 'type' => 'image', 'group' => 'homepage'],

            // Stats Section
            ['key' => 'stats_section_tagline', 'value' => 'By The Numbers', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'stats_section_title', 'value' => 'Our Core Performance Metrics', 'type' => 'text', 'group' => 'homepage'],

            // About Page
            ['key' => 'about_title', 'value' => 'Engineering the Digital Future', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_tagline', 'value' => 'Our Mission & Vision', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_story', 'value' => 'OKJTech was founded on the principle that premium digital engineering should be accessible, high-performing, and rigorously architected. We build stunning web platforms connecting ambitious businesses with their target audience through exceptional UI/UX.', 'type' => 'textarea', 'group' => 'about'],
            ['key' => 'about_image', 'value' => '/assets/images/full-stack.png', 'type' => 'image', 'group' => 'about'],
            ['key' => 'about_mission_title', 'value' => 'Building Next-Gen Systems', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_mission_text1', 'value' => 'Our mission is to translate complex business needs into clean, robust web architectures. We combine server stability with pixel-perfect client experiences.', 'type' => 'textarea', 'group' => 'about'],
            ['key' => 'about_mission_text2', 'value' => 'We envision a digital landscape where applications load instantly, feel natural, and deliver long-term business value without continuous technical debt.', 'type' => 'textarea', 'group' => 'about'],

            // Contact Page / Region & Socials
            ['key' => 'contact_email', 'value' => 'info@okjtech.co.ke', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'contact_phone', 'value' => '+254 700 000000', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'contact_address', 'value' => 'Nairobi, Kenya', 'type' => 'textarea', 'group' => 'contact'],
            ['key' => 'contact_map_url', 'value' => 'https://www.google.com/maps/embed?...', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'social_linkedin', 'value' => 'https://linkedin.com/company/okjtech', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'social_twitter', 'value' => 'https://twitter.com/okjtech', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'social_github', 'value' => 'https://github.com/okjtech', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'social_facebook', 'value' => 'https://facebook.com/okjtech', 'type' => 'text', 'group' => 'contact'],

            // Services Section on CMS
            ['key' => 'services_tagline', 'value' => 'Our Core Services', 'type' => 'text', 'group' => 'services'],
            ['key' => 'services_title', 'value' => 'Tailored Technical Capabilities', 'type' => 'text', 'group' => 'services'],
            ['key' => 'services_video_all', 'value' => '/assets/videos/services/all-services-video.mp4', 'type' => 'image', 'group' => 'services'],
            ['key' => 'services_video_software', 'value' => '/assets/videos/services/all-services-video.mp4', 'type' => 'image', 'group' => 'services'],
            ['key' => 'services_video_electronics', 'value' => '/assets/videos/services/all-services-video.mp4', 'type' => 'image', 'group' => 'services'],
            ['key' => 'services_video_innovation', 'value' => '/assets/videos/services/all-services-video.mp4', 'type' => 'image', 'group' => 'services'],
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
