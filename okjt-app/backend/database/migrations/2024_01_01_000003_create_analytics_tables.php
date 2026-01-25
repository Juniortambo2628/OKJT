<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_page_visits', function (Blueprint $table) {
            $table->id();
            $table->string('page');
            $table->string('ip_address');
            $table->text('user_agent')->nullable();
            $table->string('referrer')->nullable();
            $table->string('session_id')->nullable();
            $table->timestamp('visited_at')->useCurrent();
            $table->timestamps();
            
            $table->index(['page', 'visited_at']);
            $table->index('session_id');
        });

        Schema::create('analytics_clicks', function (Blueprint $table) {
            $table->id();
            $table->string('element_id');
            $table->string('element_type');
            $table->string('page');
            $table->string('ip_address');
            $table->string('session_id')->nullable();
            $table->integer('x_position')->nullable();
            $table->integer('y_position')->nullable();
            $table->timestamp('clicked_at')->useCurrent();
            $table->timestamps();
            
            $table->index(['page', 'clicked_at']);
        });

        Schema::create('analytics_form_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('form_type');
            $table->boolean('success')->default(false);
            $table->string('page');
            $table->string('ip_address');
            $table->string('session_id')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('analytics_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->unique();
            $table->string('ip_address');
            $table->text('user_agent')->nullable();
            $table->timestamp('start_time')->useCurrent();
            $table->timestamp('end_time')->nullable();
            $table->timestamps();
            
            $table->index('session_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_sessions');
        Schema::dropIfExists('analytics_form_submissions');
        Schema::dropIfExists('analytics_clicks');
        Schema::dropIfExists('analytics_page_visits');
    }
};

