<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * This migration originally seeded widget settings into site_settings.
     * Seed data has been moved to WidgetSettingsSeeder.
     * This migration is now a no-op for production safety.
     */
    public function up(): void
    {
        // No-op: seed data moved to WidgetSettingsSeeder
    }

    public function down(): void
    {
        // No-op
    }
};
