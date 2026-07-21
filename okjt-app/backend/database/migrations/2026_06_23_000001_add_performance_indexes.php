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

        if (Schema::hasTable('projects')) {
            if (! Schema::hasIndex('projects', 'order')) {
                Schema::table('projects', function (Blueprint $table) {
                    $table->index('order');
                });
            }
        }

        if (Schema::hasTable('consultation_requests')) {
            if (! Schema::hasIndex('consultation_requests', 'status')) {
                Schema::table('consultation_requests', function (Blueprint $table) {
                    $table->index('status');
                });
            }
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
};
