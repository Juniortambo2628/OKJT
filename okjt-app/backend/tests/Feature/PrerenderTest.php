<?php

namespace Tests\Feature;

use App\Models\Insight;
use App\Models\Pillar;
use App\Models\Project;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Each page's words and links are in the HTML the server sends, for readers that don't run JavaScript. */
class PrerenderTest extends TestCase
{
    use RefreshDatabase;

    private ?string $original = null;

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.frontend_url' => 'https://okjtech.co.ke']);
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

    private function project(string $slug, array $attributes = []): Project
    {
        return Project::updateOrCreate(['slug' => $slug], $attributes + ['type' => 'client', 'title' => ucfirst($slug), 'is_active' => true]);
    }

    public function test_a_project_page_carries_its_words_hidden_while_javascript_runs(): void
    {
        $this->project('prerender-clinic', [
            'title' => 'Prerender Clinic',
            'tagline' => 'Patient records in one place.',
            'category' => 'Health',
            'technologies' => ['Laravel', 'React'],
            'methodology' => '<p>Built with <strong>care</strong>.</p>',
            'outcome' => 'Used every day.',
        ]);

        $html = $this->get('/projects/prerender-clinic')->assertOk()->getContent();

        $this->assertStringContainsString('<div id="root"><div data-okjt-prerender><nav aria-label="Main">', $html);
        $this->assertStringContainsString('<h1>Prerender Clinic</h1>', $html);
        $this->assertStringContainsString('<p>Patient records in one place.</p>', $html);
        $this->assertStringContainsString('<dd>Laravel, React</dd>', $html);
        $this->assertStringContainsString('<h2>The approach</h2><p>Built with <strong>care</strong>.</p>', $html);
        $this->assertStringContainsString('<h2>The outcome</h2><p>Used every day.</p>', $html);
        $this->assertStringContainsString('<a href="/projects">All projects</a>', $html);
        // Hidden from visitors whose browser runs the app.
        $this->assertStringContainsString("document.documentElement.classList.add('okjt-js')", $html);
        $this->assertStringContainsString('.okjt-js [data-okjt-prerender]{display:none}', $html);
    }

    public function test_html_from_the_dashboard_is_cut_down_to_safe_tags(): void
    {
        $this->project('prerender-unsafe', [
            'methodology' => '<p onclick="steal()" style="color:red">Plain <a href="javascript:alert(1)">bad</a> <a href="https://example.com" target="_blank">good</a></p><script>alert(1)</script><img src=x onerror="alert(1)"><div><span>kept text</span></div>',
        ]);

        $html = $this->get('/projects/prerender-unsafe')->assertOk()->getContent();
        $main = substr($html, strpos($html, '<main>'));

        $this->assertStringContainsString('<p>Plain <a>bad</a> <a href="https://example.com">good</a></p>', $main);
        $this->assertStringContainsString('kept text', $main);
        foreach (['onclick', 'style=', 'javascript:', '<script', 'onerror', '<img', 'target='] as $unsafe) {
            $this->assertStringNotContainsString($unsafe, $main);
        }
    }

    public function test_list_pages_link_every_live_record(): void
    {
        $this->project('prerender-live', ['title' => 'Live one', 'tagline' => 'Shown.']);
        $this->project('prerender-hidden', ['title' => 'Hidden one', 'is_active' => false]);

        $this->get('/projects')->assertOk()
            ->assertSee('<a href="/projects/prerender-live">Live one</a> — Shown.', false)
            ->assertDontSee('prerender-hidden');
    }

    public function test_an_insight_carries_its_date_and_text(): void
    {
        $user = User::factory()->create();
        Insight::create(['title' => 'Prerendered note', 'slug' => 'prerendered-note', 'category' => 'Engineering', 'excerpt' => 'Short.', 'content' => "First paragraph.\n\nSecond paragraph.", 'user_id' => $user->id, 'is_published' => true, 'published_at' => '2026-11-02 10:00:00']);

        $this->get('/insights/prerendered-note')->assertOk()
            ->assertSee('<h1>Prerendered note</h1>', false)
            ->assertSee('<time datetime="2026-11-02">2 November 2026</time>', false)
            ->assertSee('<p>First paragraph.</p><p>Second paragraph.</p>', false);
        $this->get('/insights')->assertOk()->assertSee('<a href="/insights/prerendered-note">Prerendered note</a>', false);
    }

    public function test_a_principle_links_its_services(): void
    {
        $pillar = Pillar::updateOrCreate(['slug' => 'prerender-pillar'], ['title' => 'Prerender pillar', 'overview' => 'Why it matters.', 'is_active' => true]);
        Service::updateOrCreate(['slug' => 'prerender-service'], ['title' => 'Prerender service', 'category' => 'Engineering', 'description' => 'What it is.', 'pillar_id' => $pillar->id, 'is_active' => true]);

        $this->get('/our-approach/prerender-pillar')->assertOk()
            ->assertSee('<h1>Prerender pillar</h1>', false)
            ->assertSee('<a href="/services/prerender-service">Prerender service</a> — What it is.', false);
        $this->get('/services/prerender-service')->assertOk()->assertSee('<h1>Prerender service</h1>', false);
    }

    public function test_fixed_pages_carry_their_heading_and_the_home_page_its_work(): void
    {
        $this->project('prerender-flagship', ['title' => 'Flagship one', 'type' => 'flagship']);

        $this->get('/about')->assertOk()->assertSee('<h1>About</h1>', false);
        $this->get('/')->assertOk()
            ->assertSee('<h2>Flagship projects</h2>', false)
            ->assertSee('<a href="/projects/prerender-flagship">Flagship one</a>', false);
    }

    public function test_missing_pages_and_the_dashboard_get_nothing(): void
    {
        $this->get('/projects/no-such-project')->assertNotFound()->assertDontSee('data-okjt-prerender', false)->assertDontSee('okjt-js', false);
        $this->get('/admin')->assertOk()->assertDontSee('data-okjt-prerender', false);
    }
}
