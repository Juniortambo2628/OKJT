<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        if (Schema::hasTable('services')) {
            DB::statement('ALTER TABLE services ADD FULLTEXT INDEX fulltext_services_title_description_category (title, description, category)');
        }

        if (Schema::hasTable('insights')) {
            DB::statement('ALTER TABLE insights ADD FULLTEXT INDEX fulltext_insights_title_excerpt_category (title, excerpt, category)');
        }

        if (Schema::hasTable('projects')) {
            DB::statement('ALTER TABLE projects ADD FULLTEXT INDEX fulltext_projects_title_client_name_category (title, client_name, category)');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // Guarded with hasIndex(): on a fresh database this migration's up()
        // no-ops for `projects` (the table is created later by 2026_06_24_203255,
        // which adds its own FULLTEXT under a different name), so blindly
        // dropping `fulltext_projects_title_client_name_category` would fail.
        $indexes = [
            'services' => 'fulltext_services_title_description_category',
            'insights' => 'fulltext_insights_title_excerpt_category',
            'projects' => 'fulltext_projects_title_client_name_category',
        ];

        foreach ($indexes as $tableName => $indexName) {
            if (Schema::hasTable($tableName) && Schema::hasIndex($tableName, $indexName)) {
                DB::statement("ALTER TABLE {$tableName} DROP INDEX {$indexName}");
            }
        }
    }
};
