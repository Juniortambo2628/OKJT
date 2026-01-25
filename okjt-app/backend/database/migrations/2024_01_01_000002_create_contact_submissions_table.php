<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('country_code')->nullable();
            $table->string('phone_number')->nullable();
            $table->enum('contact_method', ['email', 'whatsapp'])->default('email');
            $table->boolean('online_consultation')->default(false);
            $table->date('consultation_date')->nullable();
            $table->time('consultation_time')->nullable();
            $table->text('message')->nullable();
            $table->boolean('consent')->default(false);
            $table->string('ip_address')->nullable();
            $table->boolean('processed')->default(false);
            $table->enum('status', ['pending', 'accepted', 'postponed', 'cancelled', 'completed'])->default('pending');
            $table->text('admin_message')->nullable();
            $table->timestamp('status_updated_at')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_submissions');
    }
};

