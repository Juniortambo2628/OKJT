<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // page_views — analytics query performance
        Schema::table('page_views', function (Blueprint $table) {
            $table->index('created_at');
            $table->index('path');
            $table->index('ip');
        });

        // insights — public listing query (is_published + published_at)
        Schema::table('insights', function (Blueprint $table) {
            $table->index(['is_published', 'published_at']);
        });

        // services — search filtering
        Schema::table('services', function (Blueprint $table) {
            $table->index('is_active');
        });

        // projects — search filtering + sort
        Schema::table('projects', function (Blueprint $table) {
            $table->index('order');
        });

        // consultation_requests — admin filtering
        Schema::table('consultation_requests', function (Blueprint $table) {
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('page_views', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['path']);
            $table->dropIndex(['ip']);
        });

        Schema::table('insights', function (Blueprint $table) {
            $table->dropIndex(['is_published', 'published_at']);
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['order']);
        });

        Schema::table('consultation_requests', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });
    }
};
