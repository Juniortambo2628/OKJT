<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // services -> pillars
        Schema::table('services', function (Blueprint $table) {
            $table->foreign('pillar_id')->references('id')->on('pillars')->nullOnDelete();
        });

        // insights -> users
        Schema::table('insights', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        // page_views - no FK needed (standalone analytics)

        // rsvps - standalone
        // consultation_requests - standalone
        // subscribers - standalone
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropForeign(['pillar_id']);
        });

        Schema::table('insights', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
    }
};
