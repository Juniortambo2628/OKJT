<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Accounts that own workspaces, and their people (owners and staff). Uses the
 * names in okjt.accounts, so set those before migrating. The workspace table
 * needs its account column (okjt.accounts.foreign_key) too.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('accounts')) {
            Schema::create('accounts', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->timestamps();
            });
        }

        $members = config('okjt.accounts.members_table');
        if (! Schema::hasTable($members)) {
            $fields = config('okjt.accounts.fields');
            Schema::create($members, function (Blueprint $table) use ($fields) {
                $table->id();
                $table->unsignedBigInteger('account_id')->index();
                $table->unsignedBigInteger('user_id')->index();
                $table->string('role', 20)->default(config('okjt.accounts.owner_role'));
                $table->boolean($fields['all'])->default(false);
                $table->string($fields['role'], 20)->nullable();
                $table->timestamps();
                $table->unique(['account_id', 'user_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists(config('okjt.accounts.members_table'));
        Schema::dropIfExists('accounts');
    }
};
