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
        $settings = [
            ['key' => 'nissi_assistant_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'widgets'],
            ['key' => 'nissi_assistant_id', 'value' => 'cl-...', 'type' => 'text', 'group' => 'widgets'],
            ['key' => 'whatsapp_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'widgets'],
            ['key' => 'whatsapp_number', 'value' => '+447000000000', 'type' => 'text', 'group' => 'widgets'],
            ['key' => 'whatsapp_message', 'value' => 'Hello, I have a question about Nissi Insights.', 'type' => 'text', 'group' => 'widgets'],
        ];

        foreach ($settings as $setting) {
            \Illuminate\Support\Facades\DB::table('site_settings')->updateOrInsert(
                ['key' => $setting['key']],
                $setting
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $keys = [
            'nissi_assistant_enabled',
            'nissi_assistant_id',
            'whatsapp_enabled',
            'whatsapp_number',
            'whatsapp_message',
        ];

        \Illuminate\Support\Facades\DB::table('site_settings')->whereIn('key', $keys)->delete();
    }
};
