<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('page_views')) {
            Schema::table('page_views', function (Blueprint $table) {
                if (!$this->hasIndex($table, ['created_at'])) {
                    $table->index('created_at');
                }
            });
        }

        if (Schema::hasTable('insights')) {
            Schema::table('insights', function (Blueprint $table) {
                if (!$this->hasIndex($table, ['is_published', 'published_at'])) {
                    $table->index(['is_published', 'published_at']);
                }
            });
        }

        if (Schema::hasTable('services')) {
            Schema::table('services', function (Blueprint $table) {
                if (!$this->hasIndex($table, ['is_active'])) {
                    $table->index('is_active');
                }
            });
        }

        if (Schema::hasTable('projects')) {
            Schema::table('projects', function (Blueprint $table) {
                if (!$this->hasIndex($table, ['order'])) {
                    $table->index('order');
                }
            });
        }

        if (Schema::hasTable('consultation_requests')) {
            Schema::table('consultation_requests', function (Blueprint $table) {
                if (!$this->hasIndex($table, ['status'])) {
                    $table->index('status');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('page_views')) {
            Schema::table('page_views', function (Blueprint $table) {
                $table->dropIndex(['created_at']);
                $table->dropIndex(['path']);
                $table->dropIndex(['ip']);
            });
        }

        if (Schema::hasTable('insights')) {
            Schema::table('insights', function (Blueprint $table) {
                $table->dropIndex(['is_published', 'published_at']);
            });
        }

        if (Schema::hasTable('services')) {
            Schema::table('services', function (Blueprint $table) {
                $table->dropIndex(['is_active']);
            });
        }

        if (Schema::hasTable('projects')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropIndex(['order']);
            });
        }

        if (Schema::hasTable('consultation_requests')) {
            Schema::table('consultation_requests', function (Blueprint $table) {
                $table->dropIndex(['status']);
            });
        }
    }

    private function hasIndex(Blueprint $table, array $columns): bool
    {
        $indexer = $table->getIndexer();
        foreach ($indexer->getIndexes() as $index) {
            if ($index->getColumns() === $columns) {
                return true;
            }
        }
        return false;
    }
};
