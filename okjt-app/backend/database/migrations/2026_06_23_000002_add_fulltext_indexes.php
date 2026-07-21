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

        if (Schema::hasTable('services')) {
            DB::statement('ALTER TABLE services DROP INDEX fulltext_services_title_description_category');
        }

        if (Schema::hasTable('insights')) {
            DB::statement('ALTER TABLE insights DROP INDEX fulltext_insights_title_excerpt_category');
        }

        if (Schema::hasTable('projects')) {
            DB::statement('ALTER TABLE projects DROP INDEX fulltext_projects_title_client_name_category');
        }
    }
};
