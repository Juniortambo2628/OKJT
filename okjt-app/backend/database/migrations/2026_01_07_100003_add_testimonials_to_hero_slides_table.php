<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hero_slides', function (Blueprint $table) {
            $table->text('testimonial_text')->nullable()->after('subtitle');
            $table->string('testimonial_author')->nullable()->after('testimonial_text');
            $table->string('testimonial_company')->nullable()->after('testimonial_author');
        });
    }

    public function down(): void
    {
        Schema::table('hero_slides', function (Blueprint $table) {
            $table->dropColumn(['testimonial_text', 'testimonial_author', 'testimonial_company']);
        });
    }
};
