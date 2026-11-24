<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** What platform staff did in the console, and to what: kept for good. */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('console_audit_logs')) {
            Schema::create('console_audit_logs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable()->index();
                $table->string('action', 40);
                $table->string('subject_type', 20);
                $table->unsignedBigInteger('subject_id')->nullable();
                $table->string('subject_label')->nullable();
                $table->json('details')->nullable();
                $table->string('ip', 45)->nullable();
                $table->timestamp('created_at')->useCurrent()->index();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('console_audit_logs');
    }
};
