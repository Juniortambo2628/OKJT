<?php

namespace Okjt\Kit\Tests\Feature;

use InvalidArgumentException;
use Okjt\Kit\Console\AuditLog;
use Okjt\Kit\Http\Controllers\SwitchController;
use Okjt\Kit\Http\Middleware\EnsureSuperadmin;
use Okjt\Kit\Http\Middleware\RequireSwitch;
use Okjt\Kit\Switches\Switches;
use Okjt\Kit\Tests\TestCase;

/** On/off switches (S2): declared in config, flipped by superadmins, read anywhere. */
class SwitchesTest extends TestCase
{
    protected function defineEnvironment($app): void
    {
        parent::defineEnvironment($app);
        $app['config']->set('okjt.switches', [
            'mpesa_extras' => ['label' => 'Sell extras with M-Pesa', 'description' => 'Guests pay for extras.', 'default' => false, 'public' => true],
            'new_reports' => ['label' => 'New reports', 'default' => true],
        ]);
    }

    protected function defineRoutes($router): void
    {
        $router->middleware(EnsureSuperadmin::class)->group(function () use ($router) {
            $router->get('/api/switches', [SwitchController::class, 'index']);
            $router->put('/api/switches/{key}', [SwitchController::class, 'update']);
        });
        $router->get('/api/public-switches', [SwitchController::class, 'publicIndex']);
        $router->middleware(RequireSwitch::class.':mpesa_extras')->get('/api/extras', fn () => 'extras');
    }

    private function superadmin()
    {
        $user = $this->person('admin@example.com');
        $user->forceFill(['is_superadmin' => true])->save();

        return $user;
    }

    public function test_a_switch_nobody_flipped_is_at_its_default_and_an_unknown_one_is_off(): void
    {
        $this->assertFalse(Switches::on('mpesa_extras'));
        $this->assertTrue(Switches::on('new_reports'));
        $this->assertFalse(Switches::on('typo_in_the_name'));
    }

    public function test_flipping_is_kept_and_reset_returns_to_the_default(): void
    {
        Switches::set('mpesa_extras', true);
        $this->assertTrue(Switches::on('mpesa_extras'));
        Switches::set('new_reports', false);
        $this->assertFalse(Switches::on('new_reports'));

        Switches::reset('new_reports');
        $this->assertTrue(Switches::on('new_reports'));
    }

    public function test_only_declared_switches_can_be_flipped(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Switches::set('not_declared', true);
    }

    public function test_a_switched_off_feature_answers_404_until_it_is_on(): void
    {
        $this->getJson('/api/extras')->assertNotFound();
        Switches::set('mpesa_extras', true);
        $this->get('/api/extras')->assertOk()->assertSee('extras');
    }

    public function test_superadmins_list_and_flip_switches_and_each_flip_is_audited(): void
    {
        $this->actingAs($this->superadmin());

        $this->getJson('/api/switches')->assertOk()
            ->assertJsonPath('data.0.key', 'mpesa_extras')
            ->assertJsonPath('data.0.label', 'Sell extras with M-Pesa')
            ->assertJsonPath('data.0.on', false)
            ->assertJsonPath('data.0.flipped', false)
            ->assertJsonPath('data.1.on', true);

        $this->putJson('/api/switches/mpesa_extras', ['on' => true])->assertOk()
            ->assertJsonPath('data.on', true)
            ->assertJsonPath('data.flipped', true)
            ->assertJsonPath('message', 'Sell extras with M-Pesa: on');
        $this->assertTrue(Switches::on('mpesa_extras'));

        $log = AuditLog::sole();
        $this->assertSame('switch.turned_on', $log->action);
        $this->assertSame('Sell extras with M-Pesa', $log->subject_label);
        $this->assertSame(['key' => 'mpesa_extras'], $log->details);

        // Setting it to what it already is changes nothing worth recording.
        $this->putJson('/api/switches/mpesa_extras', ['on' => true])->assertOk();
        $this->assertSame(1, AuditLog::count());

        $this->putJson('/api/switches/nope', ['on' => true])->assertNotFound();
        $this->putJson('/api/switches/mpesa_extras', [])->assertUnprocessable();
    }

    public function test_others_cannot_see_or_flip_switches(): void
    {
        $this->actingAs($this->person('owner@example.com'));
        $this->getJson('/api/switches')->assertForbidden();
        $this->putJson('/api/switches/mpesa_extras', ['on' => true])->assertForbidden();
        $this->assertFalse(Switches::on('mpesa_extras'));
    }

    public function test_signed_out_pages_learn_only_the_public_switches(): void
    {
        $this->getJson('/api/public-switches')->assertOk()->assertExactJson([
            'success' => true, 'message' => 'Success', 'data' => ['mpesa_extras' => false],
        ]);
    }
}
