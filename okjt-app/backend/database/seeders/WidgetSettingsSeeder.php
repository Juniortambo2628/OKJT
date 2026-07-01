<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class WidgetSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $widgets = [
            ['key' => 'nissi_assistant_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'widgets'],
            ['key' => 'nissi_assistant_id', 'value' => 'cl-k7j2m1z8n0001qz4r1a8b9c5d', 'type' => 'text', 'group' => 'widgets'],
            ['key' => 'whatsapp_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'widgets'],
            ['key' => 'whatsapp_number', 'value' => '+447000000000', 'type' => 'text', 'group' => 'widgets'],
            ['key' => 'whatsapp_message', 'value' => 'Hello, I have a question about Nissi Insights.', 'type' => 'text', 'group' => 'widgets'],
        ];

        foreach ($widgets as $widget) {
            SiteSetting::updateOrCreate(
                ['key' => $widget['key']],
                $widget
            );
        }
    }
}
