<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('innovations', function (Blueprint $table) {
            $table->string('category')->nullable()->after('url');
            $table->json('technologies')->nullable()->after('category');
            $table->string('significant_figure')->nullable()->after('technologies');
            $table->text('problem')->nullable()->after('significant_figure');
            $table->text('methodology')->nullable()->after('problem');
            $table->text('outcome')->nullable()->after('methodology');
            $table->text('testimonial_quote')->nullable()->after('outcome');
            $table->string('testimonial_author')->nullable()->after('testimonial_quote');
            $table->json('gallery')->nullable()->after('testimonial_author');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('innovations', function (Blueprint $table) {
            $table->dropColumn([
                'category',
                'technologies',
                'significant_figure',
                'problem',
                'methodology',
                'outcome',
                'testimonial_quote',
                'testimonial_author',
                'gallery'
            ]);
        });
    }
};
