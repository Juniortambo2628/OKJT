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
        Schema::table('case_studies', function (Blueprint $table) {
            $table->string('category')->nullable()->after('client_name');
            $table->json('technologies')->nullable()->after('category');
            $table->text('description')->nullable()->after('technologies');
            $table->text('testimonial_quote')->nullable()->after('outcome');
            $table->string('testimonial_author')->nullable()->after('testimonial_quote');
            $table->json('gallery')->nullable()->after('image');
            $table->string('website_url')->nullable()->after('gallery');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('case_studies', function (Blueprint $table) {
            $table->dropColumn([
                'category',
                'technologies',
                'description',
                'testimonial_quote',
                'testimonial_author',
                'gallery',
                'website_url'
            ]);
        });
    }
};
