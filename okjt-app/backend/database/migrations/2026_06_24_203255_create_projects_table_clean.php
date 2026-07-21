<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * This migration replaces the following obsolete migrations:
     * - 2026_02_25_143313_create_case_studies_table.php
     * - 2026_02_25_213559_add_significant_figures_to_case_studies_table.php
     * - 2026_04_21_123942_add_extended_fields_to_case_studies_table.php
     * - 2026_04_16_191835_create_innovations_table.php
     * - 2026_04_21_145806_add_extended_fields_to_innovations_table.php
     * - 2026_06_22_000001_merge_case_studies_and_innovations_into_projects_table.php
     *
     * On fresh databases, this creates the projects table directly.
     * On existing databases, the obsolete migrations become no-ops.
     */
    public function up(): void
    {
        if (! Schema::hasTable('projects')) {
            Schema::create('projects', function (Blueprint $table) {
                $table->id();
                $table->string('type')->default('client');
                $table->string('title');
                $table->string('slug')->unique();
                $table->string('client_name')->nullable();
                $table->string('tagline')->nullable();
                $table->string('category')->nullable();
                $table->json('technologies')->nullable();
                $table->string('significant_figure')->nullable();
                $table->text('description')->nullable();
                $table->text('problem')->nullable();
                $table->text('methodology')->nullable();
                $table->text('outcome')->nullable();
                $table->text('testimonial_quote')->nullable();
                $table->string('testimonial_author')->nullable();
                $table->string('image')->nullable();
                $table->json('gallery')->nullable();
                $table->string('website_url')->nullable();
                $table->string('url')->nullable();
                $table->boolean('is_active')->default(true);
                $table->boolean('is_featured')->default(false);
                $table->integer('order')->default(0);
                $table->timestamps();

                $table->index('type');
                $table->index('is_active');
                $table->index('is_featured');
                $table->index('category');
                $table->index('order');
            });
        }

        // Add fulltext indexes (from 2026_06_23_000002_add_fulltext_indexes.php)
        if (config('database.default') === 'mysql' && ! Schema::hasIndex('projects', 'projects_title_client_name_category_fulltext')) {
            DB::statement('ALTER TABLE `projects` ADD FULLTEXT INDEX `projects_title_client_name_category_fulltext` (`title`, `client_name`, `category`)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
