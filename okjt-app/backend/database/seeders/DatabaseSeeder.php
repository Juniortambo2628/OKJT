<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            PillarSeeder::class,
            ServiceSeeder::class,
            SiteSettingSeeder::class,
            WidgetSettingsSeeder::class,
            SectionBackgroundSeeder::class,
            ProjectSeeder::class,
            TestimonialClientSeeder::class,
            AdvancedSettingsSeeder::class,
            ValueSeeder::class,
            StatSeeder::class,
            TeamMemberSeeder::class,
            InsightSeeder::class,
            AnalyticsDataSeeder::class,
        ]);
    }
}
