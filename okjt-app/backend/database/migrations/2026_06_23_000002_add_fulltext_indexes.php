<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE services ADD FULLTEXT INDEX fulltext_services_title_description_category (title, description, category)');
        DB::statement('ALTER TABLE insights ADD FULLTEXT INDEX fulltext_insights_title_excerpt_category (title, excerpt, category)');
        DB::statement('ALTER TABLE projects ADD FULLTEXT INDEX fulltext_projects_title_client_name_category (title, client_name, category)');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE services DROP INDEX fulltext_services_title_description_category');
        DB::statement('ALTER TABLE insights DROP INDEX fulltext_insights_title_excerpt_category');
        DB::statement('ALTER TABLE projects DROP INDEX fulltext_projects_title_client_name_category');
    }
};
