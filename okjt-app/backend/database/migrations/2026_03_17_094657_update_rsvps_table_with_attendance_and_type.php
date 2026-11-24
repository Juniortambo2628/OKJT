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
        Schema::table('rsvps', function (Blueprint $table) {
            $table->string('attendance')->nullable()->after('newsletter');
            $table->string('type')->default('early_access')->after('attendance'); // 'early_access' or 'rsvp'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rsvps', function (Blueprint $table) {
            $table->dropColumn(['attendance', 'type']);
        });
    }
};
