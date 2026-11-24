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
            $table->string('sector')->nullable()->after('job_title');
            $table->string('interest')->nullable()->after('sector');
            $table->boolean('consent')->default(false)->after('interest');
            $table->boolean('newsletter')->default(false)->after('consent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rsvps', function (Blueprint $table) {
            $table->dropColumn(['sector', 'interest', 'consent', 'newsletter']);
        });
    }
};
