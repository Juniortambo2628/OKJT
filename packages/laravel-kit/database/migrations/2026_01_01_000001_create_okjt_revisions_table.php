<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Version history (Okjt\Kit\Revisions\Revision). References to users and the
 * workspace are plain indexed columns: deleting a user nulls their user_id
 * (see the README), so history outlives the people who made it.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('revisions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger(config('okjt.workspace.foreign_key'))->nullable()->index();
            $table->string('module', 40)->index();
            $table->string('subject_type');
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('subject_label')->nullable();
            $table->string('action', 20); // created | updated | deleted | restored
            $table->longText('before')->nullable();
            $table->longText('after')->nullable();
            $table->json('changed')->nullable();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->uuid('batch')->nullable()->index();
            $table->timestamps();
            $table->index(['subject_type', 'subject_id']);
            $table->index(['module', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revisions');
    }
};
