<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('page_views')) {
            if (! Schema::hasIndex('page_views', 'created_at')) {
                Schema::table('page_views', function (Blueprint $table) {
                    $table->index('created_at');
                });
            }
            if (! Schema::hasIndex('page_views', 'path')) {
                Schema::table('page_views', function (Blueprint $table) {
                    $table->index('path');
                });
            }
            if (! Schema::hasIndex('page_views', 'ip')) {
                Schema::table('page_views', function (Blueprint $table) {
                    $table->index('ip');
                });
            }
        }

        if (Schema::hasTable('insights')) {
            if (! Schema::hasIndex('insights', ['is_published', 'published_at'])) {
                Schema::table('insights', function (Blueprint $table) {
                    $table->index(['is_published', 'published_at']);
                });
            }
        }

        if (Schema::hasTable('services')) {
            if (! Schema::hasIndex('services', 'is_active')) {
                Schema::table('services', function (Blueprint $table) {
                    $table->index('is_active');
                });
            }
        }

        // NOTE: a `projects.order` block previously lived here. `projects` is not
        // created until 2026_06_24_203255, so this migration could never have
        // created that index — the create migration owns it. Removed so that
        // down() can no longer drop an index it did not create.

        if (Schema::hasTable('consultation_requests')) {
            if (! Schema::hasIndex('consultation_requests', 'status')) {
                Schema::table('consultation_requests', function (Blueprint $table) {
                    $table->index('status');
                });
            }
        }

        // NOTE: the `projects.order` block that used to live here was removed.
        // `projects` is not created until 2026_06_24_203255, so this migration
        // could never have created that index; it is owned by the create
        // migration instead. See down() below.
    }

    public function down(): void
    {
        // Every drop is guarded by hasIndex() so that rollback stays idempotent:
        // page_views.ip is also created by 2026_06_25_100750, and several of
        // these indexes may have been created by the table-create migrations.
        $indexes = [
            'page_views' => [['created_at'], ['path'], ['ip']],
            'insights' => [['is_published', 'published_at']],
            'services' => [['is_active']],
            'consultation_requests' => [['status']],
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
