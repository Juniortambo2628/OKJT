<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // First, copy data from website_url to url where url is null
        DB::statement('UPDATE `projects` SET `url` = `website_url` WHERE `url` IS NULL AND `website_url` IS NOT NULL');

        // Then drop the website_url column
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('website_url');
        });
    }

    public function down(): void
    {
        // Recreate the website_url column
        Schema::table('projects', function (Blueprint $table) {
            $table->string('website_url')->nullable()->after('gallery');
        });

        // Copy data back (url to website_url for client type projects)
        DB::statement('UPDATE `projects` SET `website_url` = `url` WHERE `type` = "client" AND `website_url` IS NULL AND `url` IS NOT NULL');
    }
};
