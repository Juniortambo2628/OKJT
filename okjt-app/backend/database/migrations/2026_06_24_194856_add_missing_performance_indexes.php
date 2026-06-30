<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rsvps', function (Blueprint $table) {
            $table->index('type');
        });

        Schema::table('pillars', function (Blueprint $table) {
            $table->index('is_active');
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->index('is_active');
        });

        Schema::table('testimonials', function (Blueprint $table) {
            $table->index('is_featured');
            $table->index('order');
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
    }

    public function down(): void
    {
        Schema::table('rsvps', function (Blueprint $table) {
            $table->dropIndex(['type']);
        });

        Schema::table('pillars', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
        });

        Schema::table('testimonials', function (Blueprint $table) {
            $table->dropIndex(['is_featured']);
            $table->dropIndex(['order']);
        });

        Schema::table('team_members', function (Blueprint $table) {
            $table->dropIndex(['order']);
        });

        Schema::table('values', function (Blueprint $table) {
            $table->dropIndex(['order']);
        });

        Schema::table('stats', function (Blueprint $table) {
            $table->dropIndex(['order']);
        });
    }
};
