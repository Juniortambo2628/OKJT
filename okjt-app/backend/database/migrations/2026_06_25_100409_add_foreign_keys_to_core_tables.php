<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('services') && Schema::hasColumn('services', 'pillar_id')) {
            $hasFk = DB::select("SELECT COUNT(*) as cnt FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'services' AND CONSTRAINT_NAME = 'services_pillar_id_foreign'");
            if (empty($hasFk) || $hasFk[0]->cnt == 0) {
                try {
                    Schema::table('services', function (Blueprint $table) {
                        $table->foreign('pillar_id')->references('id')->on('pillars')->nullOnDelete();
                    });
                } catch (\Exception $e) { /* FK may already exist or table may not support it */
                }
            }
        }

        if (Schema::hasTable('insights') && Schema::hasColumn('insights', 'user_id')) {
            $hasFk = DB::select("SELECT COUNT(*) as cnt FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'insights' AND CONSTRAINT_NAME = 'insights_user_id_foreign'");
            if (empty($hasFk) || $hasFk[0]->cnt == 0) {
                try {
                    Schema::table('insights', function (Blueprint $table) {
                        $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
                    });
                } catch (\Exception $e) { /* FK may already exist or table may not support it */
                }
            }
        }
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
