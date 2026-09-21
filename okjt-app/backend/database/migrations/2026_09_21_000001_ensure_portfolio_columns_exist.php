<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Non-destructive: only adds columns if they don't already exist.
        // The projects table should already have all needed columns from prior
        // migrations, but this guards against any drift.

        if (Schema::hasTable('projects')) {
            Schema::table('projects', function (Blueprint $table) {
                if (! Schema::hasColumn('projects', 'bg_image')) {
                    $table->string('bg_image')->nullable()->after('image');
                }
            });
        }

        // Ensure stats.description exists
        if (Schema::hasTable('stats')) {
            Schema::table('stats', function (Blueprint $table) {
                if (! Schema::hasColumn('stats', 'description')) {
                    $table->text('description')->nullable()->after('value');
                }
            });
        }
    }

    public function down(): void
    {
        // Intentionally non-destructive — nothing to reverse.
    }
};
