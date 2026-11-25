<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Contact form messages (Okjt\Kit\Content\ContactMessage): what visitors
 * sent, its status and the reply. Personal data: no IP address is kept, and
 * okjt.contact.keep_days prunes old ones.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('okjt_contact_messages')) {
            return;
        }
        Schema::create('okjt_contact_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('workspace_id')->nullable()->index();
            $table->string('name', 100);
            $table->string('email', 150);
            $table->string('topic', 60)->nullable();
            $table->string('subject', 150)->nullable();
            $table->text('message');
            $table->string('status', 20)->default('new')->index();
            $table->text('reply_message')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->unsignedBigInteger('replied_by')->nullable();
            $table->timestamps();
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('okjt_contact_messages');
    }
};
