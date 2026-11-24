<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('projects') && ! Schema::hasColumn('projects', 'bg_image')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->string('bg_image')->nullable()->after('image');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('projects') && Schema::hasColumn('projects', 'bg_image')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropColumn('bg_image');
            });
        }
    }
};
