<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Who belongs to which workspace, with what role (okjt.workspace.members_table),
 * and the superadmin flag on users.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create(config('okjt.workspace.members_table'), function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger(config('okjt.workspace.foreign_key'))->index();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('role', 20);
            $table->timestamps();
            $table->unique([config('okjt.workspace.foreign_key'), 'user_id']);
        });

        if (! Schema::hasColumn('users', 'is_superadmin')) {
            Schema::table('users', fn (Blueprint $table) => $table->boolean('is_superadmin')->default(false));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists(config('okjt.workspace.members_table'));
    }
};
