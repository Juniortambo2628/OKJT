<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Presence, "what changed" badges and invitations (CollaborationController):
 * when each person last opened each module of each workspace, and on users,
 * where they are now and who invited them.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create(config('okjt.collaboration.visits_table'), function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger(config('okjt.workspace.foreign_key'))->index();
            $table->unsignedBigInteger('user_id');
            $table->string('module', 40);
            $table->timestamp('seen_at');
            $table->unique([config('okjt.workspace.foreign_key'), 'user_id', 'module']);
        });

        Schema::table('users', function (Blueprint $table) {
            foreach ([
                'last_active_at' => fn () => $table->timestamp('last_active_at')->nullable(),
                'current_module' => fn () => $table->string('current_module', 40)->nullable(),
                'current_path' => fn () => $table->string('current_path')->nullable(),
                'invited_by' => fn () => $table->unsignedBigInteger('invited_by')->nullable(),
                'invite_accepted_at' => fn () => $table->timestamp('invite_accepted_at')->nullable(),
            ] as $column => $add) {
                if (! Schema::hasColumn('users', $column)) {
                    $add();
                }
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('okjt.collaboration.visits_table'));
    }
};
