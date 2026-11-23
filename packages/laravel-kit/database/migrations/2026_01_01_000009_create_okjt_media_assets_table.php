<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The media library (Okjt\Kit\Media): every stored upload, so a photo can be
 * picked again instead of uploaded twice. Table name from okjt.media.table
 * (default media_assets, TFE's own, so TFE skips this when it moves).
 */
return new class extends Migration
{
    public function up(): void
    {
        $table = config('okjt.media.table', 'media_assets');
        if (Schema::hasTable($table)) {
            return;
        }
        Schema::create($table, function (Blueprint $table) {
            $table->id();
            $table->string('disk')->default('public');
            $table->string('path');                         // storage-relative, e.g. assets/library/x.webp
            $table->string('url');                          // public URL
            $table->string('name');                         // original file name
            $table->string('mime')->nullable();
            $table->string('kind')->default('image')->index(); // image | video
            $table->unsignedBigInteger('size')->default(0); // bytes, after optimising
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedBigInteger('uploaded_by')->nullable()->index();
            $table->timestamps();
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('okjt.media.table', 'media_assets'));
    }
};
