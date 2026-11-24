<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * FAQs (Okjt\Kit\Content\Faq): questions and answers, in order, optionally
 * in groups (one per page). Table from okjt.faqs.table (default faqs,
 * Naoa's). A project that has one gets only the `group` column it lacks.
 */
return new class extends Migration
{
    public function up(): void
    {
        $name = config('okjt.faqs.table', 'faqs');
        $workspace = config('okjt.workspace.foreign_key', 'workspace_id');

        if (Schema::hasTable($name)) {
            if (! Schema::hasColumn($name, 'group')) {
                Schema::table($name, fn (Blueprint $table) => $table->string('group', 60)->nullable()->index());
            }

            return;
        }
        Schema::create($name, function (Blueprint $table) use ($workspace) {
            $table->id();
            $table->unsignedBigInteger($workspace)->nullable()->index();
            $table->string('group', 60)->nullable()->index();
            $table->string('question');
            $table->text('answer');
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        // Leaves a project's own table alone; drops only one this created.
    }
};
