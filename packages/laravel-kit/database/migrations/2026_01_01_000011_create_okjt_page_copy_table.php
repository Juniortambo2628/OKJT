<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Page copy (Okjt\Kit\Content\PageCopy): the admin's edits to a page
 * section's words, over the defaults in the project's config, and whether
 * the section shows. One row per section (per workspace, when
 * okjt.page_copy.per_workspace is on).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('okjt_page_copy')) {
            return;
        }
        Schema::create('okjt_page_copy', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('workspace_id')->nullable()->index();
            $table->string('section', 120);
            $table->json('overrides')->nullable();
            $table->boolean('visible')->default(true);
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->unique(['workspace_id', 'section']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('okjt_page_copy');
    }
};
