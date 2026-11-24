<?php

namespace Tests\Feature;

use App\Models\SiteSetting;
use App\Support\RetiredSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\Finder\Finder;
use Tests\TestCase;

/** The settings retired from the dashboard are ones nothing reads. */
class RetiredSettingsTest extends TestCase
{
    use RefreshDatabase;

    /** The site's and the server's code, without the dashboard (which only lists settings) and this list itself. */
    private function code(): string
    {
        $root = base_path('..');
        $files = Finder::create()->files()->name(['*.php', '*.js', '*.jsx'])
            ->in(array_filter([base_path('app'), base_path('resources'), base_path('routes'), "{$root}/web/src", base_path('../../packages/site/src'), base_path('../../packages/ui/src')], 'is_dir'))
            ->notPath('admin')->notName('RetiredSettings.php');

        return collect(iterator_to_array($files))->map(fn ($f) => $f->getContents())->implode("\n");
    }

    public function test_no_retired_setting_is_read_anywhere(): void
    {
        $code = $this->code();
        $this->assertGreaterThan(50000, strlen($code), 'the site code was found');

        foreach (RetiredSettings::KEYS as $key) {
            $this->assertDoesNotMatchRegularExpression('/[\'"`]'.preg_quote($key, '/').'[\'"`]/', $code, "{$key} is still read");
        }
    }

    public function test_settings_the_site_reads_are_not_retired(): void
    {
        foreach (['hero_about_media', 'bg_home_cta', 'bg_services_web_development', 'bg_services_ui_ux_design', 'logo_dark', 'contact_email', 'hero_rotating_words', 'chatbot_faq_data', 'enquiry_reply_message'] as $key) {
            $this->assertNotContains($key, RetiredSettings::KEYS);
        }
    }

    public function test_remove_deletes_only_the_retired_ones(): void
    {
        SiteSetting::updateOrCreate(['key' => 'vp_pillar1_title'], ['value' => 'Old', 'type' => 'text', 'group' => 'homepage']);
        SiteSetting::updateOrCreate(['key' => 'hero_tagline'], ['value' => 'Kept', 'type' => 'text', 'group' => 'homepage']);

        RetiredSettings::remove();

        $this->assertFalse(SiteSetting::where('key', 'vp_pillar1_title')->exists());
        $this->assertSame('Kept', SiteSetting::where('key', 'hero_tagline')->value('value'));
    }
}
