<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * On/off switches (okjt.switches): which declared switches someone has
 * flipped. A switch with no row here is at its declared default.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('okjt_switches')) {
            Schema::create('okjt_switches', function (Blueprint $table) {
                $table->id();
                $table->string('key', 80)->unique();
                $table->boolean('on')->default(false);
                $table->unsignedBigInteger('updated_by')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('okjt_switches');
    }
};
