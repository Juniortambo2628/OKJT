<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasIndex('rsvps', 'type')) {
            Schema::table('rsvps', function (Blueprint $table) {
                $table->index('type');
            });
        }

        if (!Schema::hasIndex('pillars', 'is_active')) {
            Schema::table('pillars', function (Blueprint $table) {
                $table->index('is_active');
            });
        }

        if (!Schema::hasIndex('clients', 'is_active')) {
            Schema::table('clients', function (Blueprint $table) {
                $table->index('is_active');
            });
        }

        if (!Schema::hasIndex('testimonials', 'is_featured')) {
            Schema::table('testimonials', function (Blueprint $table) {
                $table->index('is_featured');
            });
        }
        if (!Schema::hasIndex('testimonials', 'order')) {
            Schema::table('testimonials', function (Blueprint $table) {
                $table->index('order');
            });
        }

        if (!Schema::hasIndex('team_members', 'order')) {
            Schema::table('team_members', function (Blueprint $table) {
                $table->index('order');
            });
        }

        if (!Schema::hasIndex('values', 'order')) {
            Schema::table('values', function (Blueprint $table) {
                $table->index('order');
            });
        }

        if (!Schema::hasIndex('stats', 'order')) {
            Schema::table('stats', function (Blueprint $table) {
                $table->index('order');
            });
        }
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
