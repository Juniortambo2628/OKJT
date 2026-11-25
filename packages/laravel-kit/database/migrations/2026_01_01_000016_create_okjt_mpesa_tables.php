<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * M-Pesa (Okjt\Kit\Payments\Mpesa): the settings saved in the admin, with
 * secrets encrypted (one row for the app; one per workspace when each has its
 * own paybill), and each prompt sent and what came of it.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('okjt_mpesa_accounts')) {
            Schema::create('okjt_mpesa_accounts', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->nullable()->unique();
                $table->string('env', 20)->nullable();
                $table->string('consumer_key')->nullable();
                $table->text('consumer_secret')->nullable();
                $table->string('shortcode', 20)->nullable();
                $table->string('type', 10)->nullable();
                $table->string('till_number', 20)->nullable();
                $table->text('passkey')->nullable();
                $table->timestamp('approved_at')->nullable();
                $table->timestamps();
            });
        }
        if (! Schema::hasTable('okjt_mpesa_payments')) {
            Schema::create('okjt_mpesa_payments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->nullable()->index();
                $table->nullableMorphs('payable');
                $table->unsignedBigInteger('requested_by')->nullable();
                $table->string('phone', 20);
                $table->unsignedInteger('amount');
                $table->string('account_reference', 12);
                $table->string('status', 20)->default('pending')->index();
                $table->string('callback_token', 64)->unique();
                $table->string('merchant_request_id', 100)->nullable();
                $table->string('checkout_request_id', 100)->nullable()->index();
                $table->string('result_code', 20)->nullable();
                $table->string('result_desc')->nullable();
                $table->string('mpesa_receipt', 20)->nullable()->unique();
                $table->timestamp('paid_at')->nullable();
                $table->timestamp('last_queried_at')->nullable();
                $table->json('meta')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('okjt_mpesa_payments');
        Schema::dropIfExists('okjt_mpesa_accounts');
    }
};
