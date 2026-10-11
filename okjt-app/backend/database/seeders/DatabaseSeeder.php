<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Every seeder below truncates or force-deletes real tables, so this
     * pipeline is scoped to the local environment. On staging/production run an
     * explicit seeder instead, e.g. `php artisan db:seed --class=UserSeeder`.
     */
    public function run(): void
    {
        if (! app()->environment('local')) {
            $this->command?->warn(
                'DatabaseSeeder is local-only: its seeders truncate content and analytics tables. '.
                'Run an explicit --class= seeder instead.'
            );

            return;
        }

        Schema::disableForeignKeyConstraints();

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

        Schema::enableForeignKeyConstraints();
    }
}
