<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('projects', 'url')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->string('url')->nullable()->after('gallery');
            });
        }

        if (Schema::hasColumn('projects', 'website_url') && Schema::hasColumn('projects', 'url')) {
            DB::statement('UPDATE `projects` SET `url` = `website_url` WHERE `url` IS NULL AND `website_url` IS NOT NULL');
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('projects', 'website_url')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->string('website_url')->nullable()->after('gallery');
            });
            DB::statement('UPDATE `projects` SET `website_url` = `url` WHERE `type` = "client" AND `website_url` IS NULL AND `url` IS NOT NULL');
        }
    }
};
