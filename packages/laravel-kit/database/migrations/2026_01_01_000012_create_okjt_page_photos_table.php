<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Page photos (Okjt\Kit\Content\PagePhotos): the pictures a place on the
 * site shows instead of its default, in order. One row per place (per
 * workspace, when okjt.page_photos.per_workspace is on).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('okjt_page_photos')) {
            return;
        }
        Schema::create('okjt_page_photos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('workspace_id')->nullable()->index();
            $table->string('key', 64);
            $table->json('images');
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->unique(['workspace_id', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('okjt_page_photos');
    }
};
