<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Who an M-Pesa payment pays, when a project pays more than one place (Mpesa::start's `payee`, PayeeShortcodes). */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('okjt_mpesa_payments') && ! Schema::hasColumn('okjt_mpesa_payments', 'payee')) {
            Schema::table('okjt_mpesa_payments', fn (Blueprint $table) => $table->string('payee', 100)->nullable()->after('requested_by'));
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('okjt_mpesa_payments', 'payee')) {
            Schema::table('okjt_mpesa_payments', fn (Blueprint $table) => $table->dropColumn('payee'));
        }
    }
};
