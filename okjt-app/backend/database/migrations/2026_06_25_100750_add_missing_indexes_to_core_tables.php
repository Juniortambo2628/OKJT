<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $indexes = [
            'subscribers' => [['is_active', 'created_at']],
            'rsvps' => [['type', 'attendance'], ['email', 'type']],
            'consultation_requests' => [['status', 'created_at']],
            'page_views' => [['path', 'created_at'], ['ip']],
            'team_members' => [['order']],
            'values' => [['order']],
            'stats' => [['order']],
            'clients' => [['order']],
            'testimonials' => [['order']],
        ];

        foreach ($indexes as $table => $indexColumns) {
            if (Schema::hasTable($table)) {
                foreach ($indexColumns as $columns) {
                    $indexName = $table.'_'.implode('_', $columns).'_index';
                    if (! Schema::hasIndex($table, $indexName)) {
                        try {
                            Schema::table($table, function (Blueprint $table) use ($columns) {
                                $table->index($columns);
                            });
                        } catch (Exception $e) {
                            // Skip indexes that exceed key length limits
                        }
                    }
                }
            }
        }
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
