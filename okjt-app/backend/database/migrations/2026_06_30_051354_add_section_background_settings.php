<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * This migration originally seeded hero-media section background settings.
     * Seed data has been moved to SectionBackgroundSeeder.
     * This migration is now a no-op for production safety.
     */
    public function up(): void
    {
        // No-op: seed data moved to SectionBackgroundSeeder
    }

    public function down(): void
    {
        // No-op
    }
};
