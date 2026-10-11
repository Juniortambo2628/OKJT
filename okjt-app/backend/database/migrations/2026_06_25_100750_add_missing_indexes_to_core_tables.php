<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Log;
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
                        } catch (Throwable $e) {
                            // Skip indexes that exceed key length limits, but
                            // never fail silently: a swallowed error here is
                            // how the rsvps indexes went missing unnoticed.
                            Log::warning('Skipping index '.$indexName.' on '.$table.': '.$e->getMessage(), [
                                'table' => $table,
                                'columns' => $columns,
                                'index' => $indexName,
                            ]);
                        }
                    }
                }
            }
        }
    }

    public function down(): void
    {
        // Guarded with hasIndex() so rollback is idempotent: page_views.ip is
        // also created by 2026_06_23_000001, and `order` on several tables
        // matches Laravel's default index name and may pre-date this migration.
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

        foreach ($indexes as $tableName => $indexColumns) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            foreach ($indexColumns as $columns) {
                if (Schema::hasIndex($tableName, $columns)) {
                    Schema::table($tableName, function (Blueprint $table) use ($columns) {
                        $table->dropIndex($columns);
                    });
                }
            }
        }
    }
};
