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

    public function test_the_home_page_on_www_and_api_redirects_to_the_main_domain(): void
    {
        $this->get('https://www.okjtech.co.ke/')->assertStatus(301)->assertRedirect('https://okjtech.co.ke/');
        $this->get('https://api.okjtech.co.ke/')->assertStatus(301)->assertRedirect('https://okjtech.co.ke/');
    }

    public function test_apache_sends_the_home_page_to_laravel_not_to_index_html(): void
    {
        // Without this, Apache answers "/" with public/index.html as a plain
        // file, so the redirects above never run and www. and api. serve a
        // second copy of the home page.
        $htaccess = file_get_contents(public_path('.htaccess'));
        $this->assertMatchesRegularExpression('/^DirectoryIndex index\.php$/m', $htaccess);
    }

    public function test_robots_txt_points_to_the_sitemap_and_keeps_out_of_the_dashboard(): void
    {
        $robots = file_get_contents(public_path('robots.txt'));
        $this->assertStringContainsString('Sitemap: https://okjtech.co.ke/sitemap.xml', $robots);
        $this->assertStringContainsString('Disallow: /admin', $robots);
    }

    public function test_robots_txt_lets_search_engines_fetch_the_api_the_pages_render_from(): void
    {
        $robots = file_get_contents(public_path('robots.txt'));
        $this->assertDoesNotMatchRegularExpression('#^\s*Disallow:\s*/api#mi', $robots);
    }

    public function test_api_answers_are_never_listed_in_search_results(): void
    {
        $this->getJson('/api/projects')->assertOk()->assertHeader('X-Robots-Tag', 'noindex');
    }

    public function test_the_misspelt_case_study_address_moves_to_the_right_one(): void
    {
        // As before the move: the misspelt address only.
        Project::withTrashed()->where('slug', 'dickson-gitonga-advocates')->forceDelete();
        Project::updateOrCreate(['slug' => 'dickson-gongona-advocates'], ['type' => 'client', 'title' => 'Dickson, Gitonga Advocates LLP', 'is_active' => true]);
        (require database_path('migrations/2026_11_20_000004_dickson_gitonga_slug.php'))->up();

        $this->assertTrue(Project::where('slug', 'dickson-gitonga-advocates')->exists());
        $this->assertFalse(Project::where('slug', 'dickson-gongona-advocates')->exists());
        $this->get('/projects/dickson-gongona-advocates')->assertStatus(301)->assertRedirect('/projects/dickson-gitonga-advocates');
        $this->get('/projects/dickson-gitonga-advocates')->assertOk()->assertSee('<link rel="canonical" href="https://okjtech.co.ke/projects/dickson-gitonga-advocates" />', false);
        $this->get('/sitemap.xml')->assertSee('/projects/dickson-gitonga-advocates</loc>', false)->assertDontSee('gongona');
    }
}
