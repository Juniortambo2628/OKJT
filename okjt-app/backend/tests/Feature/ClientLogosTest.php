<?php

namespace Tests\Feature;

use App\Models\Client;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The 2026-11-23 client logos: empty logos are filled by client name, an
 * uploaded logo is kept, and every logo the migration names ships with the app.
 */
class ClientLogosTest extends TestCase
{
    use RefreshDatabase;

    private function migration(): object
    {
        return require database_path('migrations/2026_11_23_000001_client_logos.php');
    }

    public function test_empty_logos_are_filled_and_uploads_kept(): void
    {
        $gm = Client::create(['name' => 'GM Coaching', 'logo' => null, 'is_active' => true]);
        $nyalife = Client::create(['name' => 'nyalife clinic', 'logo' => '', 'is_active' => true]);
        $uploaded = Client::create(['name' => 'Tena', 'logo' => '/storage/uploads/tena.png', 'is_active' => true]);
        $unknown = Client::create(['name' => 'Global Harmony Initiative', 'logo' => null, 'is_active' => true]);

        $this->migration()->up();

        $this->assertSame('/assets/images/clients/gm-coaching.webp', $gm->fresh()->logo);
        $this->assertSame('/assets/images/clients/nyalife-womens-clinic.webp', $nyalife->fresh()->logo);
        $this->assertSame('/storage/uploads/tena.png', $uploaded->fresh()->logo);
        $this->assertNull($unknown->fresh()->logo);
    }

    public function test_every_logo_ships_with_the_app(): void
    {
        foreach (array_keys($this->migration()::LOGOS) as $file) {
            $this->assertFileExists(base_path("../web/public/assets/images/clients/{$file}"), $file);
        }
    }
}
