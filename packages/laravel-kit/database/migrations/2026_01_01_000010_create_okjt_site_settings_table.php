<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Site settings (Okjt\Kit\Content\SiteSettings): the words, pictures and
 * switches a site's pages read, edited in the admin. Table name from
 * okjt.site_settings.table (default site_settings, the shape okjt-app and
 * TFE already have, so they skip this).
 */
return new class extends Migration
{
    public function up(): void
    {
        $table = config('okjt.site_settings.table', 'site_settings');
        if (Schema::hasTable($table)) {
            return;
        }
        Schema::create($table, function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('text');
            $table->string('group')->default('general')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('okjt.site_settings.table', 'site_settings'));
    }
};
