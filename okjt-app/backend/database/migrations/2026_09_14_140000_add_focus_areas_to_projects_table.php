<?php

use App\Models\Project;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add a `focus_areas` JSON column to projects so the CMS can edit the three
 * short bullets that render inside the hero's meta strip on the single-project
 * page. Backfills sensible defaults from the previous frontend fallbacks so
 * every existing record keeps a value once the front-end starts reading it.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->json('focus_areas')->nullable()->after('technologies');
        });

        // Backfill with the same defaults the frontend used to hard-code.
        // Client and flagship variants stay distinct so the wording remains
        // sector-appropriate for existing entries.
        Project::query()->chunkById(200, function ($projects) {
            foreach ($projects as $project) {
                if (! empty($project->focus_areas)) {
                    continue;
                }
                $project->focus_areas = $project->type === 'client'
                    ? ['Digital transformation', 'Workflow automation', 'Interface and experience']
                    : ['Scalable architecture', 'Data integrity and security', 'Human-centred workflows'];
                $project->save();
            }
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('focus_areas');
        });
    }
};
