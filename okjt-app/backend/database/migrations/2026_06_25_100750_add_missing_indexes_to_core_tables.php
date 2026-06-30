<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscribers', function (Blueprint $table) {
            $table->index(['is_active', 'created_at']);
        });

        Schema::table('rsvps', function (Blueprint $table) {
            $table->index(['type', 'attendance']);
            $table->index(['email', 'type']);
        });

        Schema::table('consultation_requests', function (Blueprint $table) {
            $table->index(['status', 'created_at']);
        });

        Schema::table('page_views', function (Blueprint $table) {
            $table->index(['path', 'created_at']);
            $table->index('ip');
        });

        Schema::table('team_members', function (Blueprint $table) {
            $table->index('order');
        });

        Schema::table('values', function (Blueprint $table) {
            $table->index('order');
        });

        Schema::table('stats', function (Blueprint $table) {
            $table->index('order');
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->index('order');
        });

        Schema::table('testimonials', function (Blueprint $table) {
            $table->index('order');
        });
    }

    public function down(): void
    {
        Schema::table('subscribers', function (Blueprint $table) {
            $table->dropIndex(['is_active', 'created_at']);
        });

        Schema::table('rsvps', function (Blueprint $table) {
            $table->dropIndex(['type', 'attendance']);
            $table->dropIndex(['email', 'type']);
        });

        Schema::table('consultation_requests', function (Blueprint $table) {
            $table->dropIndex(['status', 'created_at']);
        });

        Schema::table('page_views', function (Blueprint $table) {
            $table->dropIndex(['path', 'created_at']);
            $table->dropIndex('ip');
        });

        Schema::table('team_members', function (Blueprint $table) {
            $table->dropIndex('order');
        });

        Schema::table('values', function (Blueprint $table) {
            $table->dropIndex('order');
        });

        Schema::table('stats', function (Blueprint $table) {
            $table->dropIndex('order');
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->dropIndex('order');
        });

        Schema::table('testimonials', function (Blueprint $table) {
            $table->dropIndex('order');
        });
    }
};
