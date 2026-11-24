<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** A project's logo, shown white in the home page's carousel of flagship products. */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('projects', 'logo')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->string('logo')->nullable()->after('bg_image');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('projects', 'logo')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropColumn('logo');
            });
        }
    }
};
