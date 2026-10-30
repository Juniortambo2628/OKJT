<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Billing is per account: its plan (and until when a paid one lasts), and
 * every payment made through Paystack, kept as the account's receipts.
 * (Needs the accounts table.)
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('accounts', 'plan')) {
            Schema::table('accounts', function (Blueprint $table) {
                $table->string('plan', 30)->default(config('okjt.billing.default_plan', 'free'));
                $table->timestamp('plan_expires_at')->nullable();
            });
        }

        if (! Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('account_id')->index();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('reference', 64)->unique();
                $table->string('plan', 30);
                $table->unsignedInteger('amount'); // smallest unit (cents), as Paystack counts
                $table->string('currency', 3);
                $table->string('status', 20)->default('pending'); // pending | success | failed
                $table->string('channel', 30)->nullable(); // card, mobile_money, ...
                $table->timestamp('paid_at')->nullable();
                $table->json('gateway_response')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        if (Schema::hasColumn('accounts', 'plan')) {
            Schema::table('accounts', fn (Blueprint $table) => $table->dropColumn(['plan', 'plan_expires_at']));
        }
    }
};
