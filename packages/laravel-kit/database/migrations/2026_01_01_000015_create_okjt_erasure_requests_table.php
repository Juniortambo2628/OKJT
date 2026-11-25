<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Requests from people to delete their data (Okjt\Kit\Privacy\ErasureRequest,
 * from Naoa): who asked, how to reach them, the date it must be done by, and
 * what was done. Kept after it is done, as the record that it was.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('okjt_erasure_requests')) {
            return;
        }
        Schema::create('okjt_erasure_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('workspace_id')->nullable()->index();
            $table->string('name', 120);
            $table->string('email', 191)->nullable();
            $table->string('phone', 50)->nullable();
            $table->text('details')->nullable();
            $table->string('subject_id', 64)->nullable();
            $table->string('status', 20)->default('received')->index();
            $table->timestamp('due_at')->index();
            $table->timestamp('completed_at')->nullable();
            $table->unsignedBigInteger('handled_by')->nullable();
            $table->text('outcome')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('okjt_erasure_requests');
    }
};
