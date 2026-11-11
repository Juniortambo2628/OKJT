<?php

namespace Tests\Feature;

use App\Models\Insight;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/** What search engines see: one address per page, a sitemap, and structured data. */
class SeoTest extends TestCase
{
    use RefreshDatabase;

    private ?string $original = null;

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.frontend_url' => 'https://okjtech.co.ke']);
        Cache::flush();
        $index = public_path('index.html');
        $this->original = is_file($index) ? file_get_contents($index) : null;
        file_put_contents($index, "<!doctype html><html><head>\n<!--okjt:seo--><title>Default</title><!--/okjt:seo-->\n</head><body><div id=\"root\"></div></body></html>");
    }

    protected function tearDown(): void
    {
        $index = public_path('index.html');
        $this->original === null ? @unlink($index) : file_put_contents($index, $this->original);
        parent::tearDown();
    }

    public function test_www_pages_redirect_to_the_main_domain(): void
    {
        $this->get('http://www.okjtech.co.ke/about?x=1')
            ->assertStatus(301)
            ->assertRedirect('https://okjtech.co.ke/about?x=1');
    }

    public function test_old_portfolio_addresses_redirect_to_projects(): void
    {
        $this->get('/portfolio')->assertStatus(301)->assertRedirect('/projects');
        $this->get('/portfolio/najenga')->assertStatus(301)->assertRedirect('/projects/najenga');
    }

    public function test_the_sitemap_lists_live_pages_only_on_the_main_domain(): void
    {
        $user = User::factory()->create();
        Project::updateOrCreate(['slug' => 'seo-live'], ['type' => 'client', 'title' => 'Live', 'is_active' => true]);
        Project::updateOrCreate(['slug' => 'seo-hidden'], ['type' => 'client', 'title' => 'Hidden', 'is_active' => false]);
        Insight::create(['title' => 'Note', 'slug' => 'seo-note', 'content' => '<p>x</p>', 'user_id' => $user->id, 'is_published' => true, 'published_at' => now()]);
        Insight::create(['title' => 'Draft', 'slug' => 'seo-draft', 'content' => '<p>x</p>', 'user_id' => $user->id, 'is_published' => false]);

        $this->get('/sitemap.xml')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
            ->assertSee('<loc>https://okjtech.co.ke/</loc>', false)
            ->assertSee('<loc>https://okjtech.co.ke/projects/seo-live</loc>', false)
            ->assertSee('<loc>https://okjtech.co.ke/insights/seo-note</loc>', false)
            ->assertDontSee('seo-hidden')
            ->assertDontSee('seo-draft')
            ->assertDontSee('/admin');
    }

    public function test_an_article_carries_article_structured_data(): void
    {
        $user = User::factory()->create();
        Insight::create(['title' => 'Tena means again', 'slug' => 'tena-means-again', 'category' => 'Hospitality', 'excerpt' => 'Guest WiFi.', 'content' => '<p>x</p>', 'user_id' => $user->id, 'is_published' => true, 'published_at' => now()]);

        $this->get('/insights/tena-means-again')
            ->assertOk()
            ->assertSee('<meta property="og:type" content="article" />', false)
            ->assertSee('"@type":"Article"', false)
            ->assertSee('"headline":"Tena means again"', false);
    }

    public function test_robots_txt_points_to_the_sitemap_and_keeps_out_of_the_dashboard(): void
    {
        $robots = file_get_contents(public_path('robots.txt'));
        $this->assertStringContainsString('Sitemap: https://okjtech.co.ke/sitemap.xml', $robots);
        $this->assertStringContainsString('Disallow: /admin', $robots);
        $this->assertStringContainsString('Disallow: /api/', $robots);
    }
}
