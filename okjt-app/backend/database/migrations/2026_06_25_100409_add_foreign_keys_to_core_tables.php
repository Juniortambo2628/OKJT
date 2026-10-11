<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Is the named constraint already present?
     *
     * information_schema is MySQL-only, so any other driver reports "absent"
     * and lets the guarded try/catch below decide. Without this guard the
     * migration threw on SQLite, which is what .env.example ships.
     */
    protected function foreignKeyExists(string $tableName, string $constraintName): bool
    {
        if (! in_array(DB::getDriverName(), ['mysql', 'mariadb'], true)) {
            return false;
        }

        $rows = DB::select(
            'SELECT COUNT(*) as cnt FROM information_schema.TABLE_CONSTRAINTS
             WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?',
            [$tableName, $constraintName]
        );

        return ! empty($rows) && (int) $rows[0]->cnt > 0;
    }

    public function up(): void
    {
        if (Schema::hasTable('services') && Schema::hasColumn('services', 'pillar_id')
            && ! $this->foreignKeyExists('services', 'services_pillar_id_foreign')) {
            try {
                Schema::table('services', function (Blueprint $table) {
                    $table->foreign('pillar_id')->references('id')->on('pillars')->nullOnDelete();
                });
            } catch (Exception $e) { /* FK may already exist or table may not support it */
            }
        }

        if (Schema::hasTable('insights') && Schema::hasColumn('insights', 'user_id')
            && ! $this->foreignKeyExists('insights', 'insights_user_id_foreign')) {
            try {
                Schema::table('insights', function (Blueprint $table) {
                    $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
                });
            } catch (Exception $e) { /* FK may already exist or table may not support it */
            }
        }
    }

    public function down(): void
    {
        foreach (['services' => 'pillar_id', 'insights' => 'user_id'] as $tableName => $column) {
            if (! Schema::hasTable($tableName) || ! Schema::hasColumn($tableName, $column)) {
                continue;
            }

            try {
                Schema::table($tableName, function (Blueprint $table) use ($column) {
                    $table->dropForeign([$column]);
                });
            } catch (Exception $e) { /* constraint may not exist on this driver */
            }
        }
    }
};
