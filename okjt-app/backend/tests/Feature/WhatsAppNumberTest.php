<?php

namespace Tests\Feature;

use App\Models\SiteSetting;
use Database\Seeders\WidgetSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** The WhatsApp button opens the studio's own number, not a placeholder. */
class WhatsAppNumberTest extends TestCase
{
    use RefreshDatabase;

    private function runMigration(): void
    {
        (require database_path('migrations/2026_11_19_000001_whatsapp_number_from_contact_phone.php'))->up();
    }

    private function setNumber(string $value): void
    {
        SiteSetting::updateOrCreate(['key' => 'whatsapp_number'], ['value' => $value, 'type' => 'text', 'group' => 'widgets']);
    }

    public function test_the_placeholder_number_becomes_the_studio_number(): void
    {
        $this->setNumber('+447000000000');

        $this->runMigration();

        $this->assertSame('+254705883227', SiteSetting::where('key', 'whatsapp_number')->value('value'));
    }

    public function test_a_number_set_in_the_dashboard_is_kept(): void
    {
        $this->setNumber('+254700111222');

        $this->runMigration();

        $this->assertSame('+254700111222', SiteSetting::where('key', 'whatsapp_number')->value('value'));
    }

    public function test_the_seeder_no_longer_seeds_the_placeholder(): void
    {
        $this->seed(WidgetSettingsSeeder::class);

        $this->assertSame('+254705883227', SiteSetting::where('key', 'whatsapp_number')->value('value'));
        $this->assertStringNotContainsString('Nissi', SiteSetting::where('key', 'whatsapp_message')->value('value'));
    }
}
