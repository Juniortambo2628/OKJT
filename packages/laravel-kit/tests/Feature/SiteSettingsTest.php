<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Support\Facades\DB;
use Okjt\Kit\Console\AuditLog;
use Okjt\Kit\Content\SiteSettings;
use Okjt\Kit\Http\Controllers\SiteSettingController;
use Okjt\Kit\Http\Middleware\EnsureSuperadmin;
use Okjt\Kit\Tests\TestCase;

/** Site settings (S6, step 1), from okjt-app. */
class SiteSettingsTest extends TestCase
{
    protected function defineEnvironment($app): void
    {
        parent::defineEnvironment($app);
        $app['config']->set('okjt.site_settings.public_groups', ['contact', 'homepage']);
    }

    protected function defineRoutes($router): void
    {
        $router->get('/api/site-settings', [SiteSettingController::class, 'publicIndex']);
        $router->middleware(EnsureSuperadmin::class)->group(function () use ($router) {
            $router->get('/api/admin/site-settings', [SiteSettingController::class, 'index']);
            $router->put('/api/admin/site-settings', [SiteSettingController::class, 'update']);
        });
    }

    private function admin()
    {
        $user = $this->person('admin@example.com');
        $user->forceFill(['is_superadmin' => true])->save();

        return $user;
    }

    public function test_reading_with_defaults_groups_and_switches(): void
    {
        $this->assertSame('hi@example.com', SiteSettings::get('contact_email', 'hi@example.com'));

        SiteSettings::put([
            'contact_email' => ['value' => 'info@example.com', 'group' => 'contact'],
            'contact_phone' => ['value' => '+254 700 000000', 'group' => 'contact'],
            'maintenance_active' => ['value' => '1', 'type' => 'boolean', 'group' => 'maintenance'],
        ]);

        $this->assertSame('info@example.com', SiteSettings::get('contact_email', 'hi@example.com'));
        $this->assertSame(['contact_email' => 'info@example.com', 'contact_phone' => '+254 700 000000'], SiteSettings::group('contact'));
        $this->assertTrue(SiteSettings::bool('maintenance_active'));
        $this->assertFalse(SiteSettings::bool('nothing_here'));
    }

    public function test_a_save_keeps_type_and_group_and_the_creation_date(): void
    {
        SiteSettings::put(['hero_title' => ['value' => 'Old', 'type' => 'textarea', 'group' => 'homepage']]);
        $created = DB::table('site_settings')->where('key', 'hero_title')->value('created_at');
        $this->travel(5)->minutes();

        SiteSettings::put(['hero_title' => ['value' => 'New']]);

        $row = DB::table('site_settings')->where('key', 'hero_title')->first();
        $this->assertSame(['New', 'textarea', 'homepage'], [$row->value, $row->type, $row->group]);
        $this->assertSame($created, $row->created_at);
    }

    public function test_admins_list_and_save_a_batch_and_each_save_is_audited_without_values(): void
    {
        $this->actingAs($this->admin());

        $this->putJson('/api/admin/site-settings', ['settings' => [
            ['key' => 'contact_email', 'value' => 'info@example.com', 'group' => 'contact'],
            ['key' => 'hero_title', 'value' => 'Welcome', 'type' => 'text', 'group' => 'homepage'],
        ]])->assertOk()->assertJsonPath('message', 'Settings saved');

        $this->getJson('/api/admin/site-settings')->assertOk()
            ->assertJsonPath('data.0.key', 'contact_email')
            ->assertJsonPath('data.1.value', 'Welcome');

        $log = AuditLog::sole();
        $this->assertSame('settings.updated', $log->action);
        $this->assertSame(['keys' => ['contact_email', 'hero_title']], $log->details);
        $this->assertStringNotContainsString('info@example.com', json_encode($log->details));
    }

    public function test_bad_keys_are_refused(): void
    {
        $this->actingAs($this->admin());
        $this->putJson('/api/admin/site-settings', ['settings' => [['key' => 'has spaces', 'value' => 'x']]])->assertUnprocessable();
        $this->putJson('/api/admin/site-settings', ['settings' => []])->assertUnprocessable();
    }

    public function test_others_cannot_read_or_change_the_admin_list(): void
    {
        $this->actingAs($this->person('owner@example.com'));
        $this->getJson('/api/admin/site-settings')->assertForbidden();
        $this->putJson('/api/admin/site-settings', ['settings' => [['key' => 'x', 'value' => 'y']]])->assertForbidden();
    }

    public function test_signed_out_pages_read_only_the_public_groups(): void
    {
        SiteSettings::put([
            'contact_email' => ['value' => 'info@example.com', 'group' => 'contact'],
            'email_welcome_body' => ['value' => 'Internal wording', 'group' => 'email'],
        ]);

        $this->getJson('/api/site-settings')->assertOk()->assertExactJson([
            'success' => true, 'message' => 'Success', 'data' => ['contact_email' => 'info@example.com'],
        ]);
    }
}
