<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\SiteSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Item 3: the headline, the starting price and the case study figures. */
class PositioningTest extends TestCase
{
    use RefreshDatabase;

    private function runMigration(): void
    {
        (require database_path('migrations/2026_11_20_000003_positioning_and_trust.php'))->up();
    }

    private function setting(string $key, string $value): void
    {
        SiteSetting::updateOrCreate(['key' => $key], ['value' => $value, 'type' => 'text', 'group' => 'homepage']);
    }

    public function test_the_headline_changes_only_where_it_still_has_the_old_words(): void
    {
        $this->setting('hero_tagline', 'Tell your stories with confidence');
        $this->setting('hero_title_line2', 'Written by Kevin in the dashboard');

        $this->runMigration();

        $this->assertSame('Product engineering for African markets', SiteSetting::where('key', 'hero_tagline')->value('value'));
        $this->assertSame('Written by Kevin in the dashboard', SiteSetting::where('key', 'hero_title_line2')->value('value'));
    }

    public function test_the_starting_price_is_set(): void
    {
        $this->assertSame('$2,000', SiteSetting::where('key', 'starting_price')->value('value'));
    }

    public function test_figures_fill_only_empty_case_studies(): void
    {
        Project::updateOrCreate(['slug' => 'naoa'], ['type' => 'flagship', 'title' => 'Naoa', 'is_active' => true, 'significant_figure' => null]);
        Project::updateOrCreate(['slug' => 'nyalife-hms'], ['type' => 'client', 'title' => 'Nyalife', 'is_active' => true, 'significant_figure' => 'Set by hand']);

        $this->runMigration();

        $this->assertSame('250 guests, KSh 300,000+ in gifts', Project::where('slug', 'naoa')->value('significant_figure'));
        $this->assertSame('Set by hand', Project::where('slug', 'nyalife-hms')->value('significant_figure'));
    }

    public function test_how_we_work_is_a_page_in_the_sitemap(): void
    {
        $index = public_path('index.html');
        $original = is_file($index) ? file_get_contents($index) : null;
        file_put_contents($index, '<!doctype html><html><head><!--okjt:seo--><title>x</title><!--/okjt:seo--></head><body><div id="root"></div></body></html>');
        try {
            $this->get('/how-we-work')->assertOk()->assertSee('<h1>How we work</h1>', false)->assertSee('index, follow', false);
            $this->get('/sitemap.xml')->assertSee('/how-we-work</loc>', false);
        } finally {
            $original === null ? @unlink($index) : file_put_contents($index, $original);
        }
    }
}
