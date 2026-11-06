<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The site's pages (okjt-app/web, built into public/) are answered by
 * SpaController with each page's own title, description and preview tags.
 */
class SitePagesTest extends TestCase
{
    use RefreshDatabase;

    private string $index;

    private ?string $original = null;

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.frontend_url' => 'https://okjtech.co.ke']);
        $this->index = public_path('index.html');
        $this->original = is_file($this->index) ? file_get_contents($this->index) : null;
        file_put_contents($this->index, "<!doctype html><html><head>\n<!--okjt:seo--><title>Default</title><!--/okjt:seo-->\n</head><body><div id=\"root\"></div></body></html>");
    }

    protected function tearDown(): void
    {
        $this->original === null ? @unlink($this->index) : file_put_contents($this->index, $this->original);
        parent::tearDown();
    }

    public function test_a_page_gets_its_own_title_and_description(): void
    {
        $this->get('/about')
            ->assertOk()
            ->assertSee('<title>About | OKJTech</title>', false)
            ->assertSee('<link rel="canonical" href="https://okjtech.co.ke/about" />', false)
            ->assertSee('content="index, follow"', false)
            ->assertDontSee('<title>Default</title>', false)
            ->assertSee('<div id="root"></div>', false);
    }

    public function test_a_page_made_from_data_uses_the_record(): void
    {
        Service::create([
            'title' => 'Admin dashboards', 'slug' => 'admin-dashboards', 'category' => 'Web Development',
            'description' => '<p>Dashboards for the people who run the platform.</p>', 'image' => 'uploads/dash.webp', 'is_active' => true,
        ]);

        $this->get('/services/admin-dashboards')
            ->assertOk()
            ->assertSee('<title>Admin dashboards | OKJTech</title>', false)
            ->assertSee('content="Dashboards for the people who run the platform."', false)
            ->assertSee('https://okjtech.co.ke/storage/uploads/dash.webp', false);
    }

    public function test_a_missing_record_or_page_answers_404_and_is_not_indexed(): void
    {
        $this->get('/services/nothing-here')->assertNotFound()->assertSee('noindex, nofollow', false)->assertSee('<div id="root"></div>', false);
        $this->get('/no-such-page')->assertNotFound();
    }

    public function test_the_dashboard_pages_are_served_but_not_indexed(): void
    {
        $this->get('/admin/projects')->assertOk()->assertSee('noindex, nofollow', false);
    }

    public function test_the_api_host_sends_pages_to_the_main_domain(): void
    {
        $this->get('http://api.okjtech.co.ke/about?x=1')->assertRedirect('https://okjtech.co.ke/about?x=1');
    }

    public function test_api_routes_are_not_pages(): void
    {
        $this->getJson('/api/services')->assertOk()->assertJson([]);
        $this->getJson('/api/nothing')->assertNotFound();
    }

    public function test_the_dashboard_sees_fresh_lists_but_visitors_get_cacheable_ones(): void
    {
        $visitor = $this->getJson('/api/services');
        $this->assertStringContainsString('max-age=60', $visitor->headers->get('Cache-Control'));

        $admin = User::factory()->create(['is_admin' => true]);
        $token = $admin->createToken('test')->plainTextToken;
        $dashboard = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/services');
        $this->assertStringNotContainsString('max-age=60', (string) $dashboard->headers->get('Cache-Control'));
    }

    public function test_the_signed_in_user_says_whether_they_are_an_admin(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $token = $admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/user')->assertOk()->assertJsonPath('is_admin', true);
    }

    public function test_an_admin_can_give_a_project_a_logo(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $token = $admin->createToken('test')->plainTextToken;

        $id = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/projects', ['type' => 'flagship', 'title' => 'Logo Test Product', 'logo' => '/storage/uploads/logo.png'])
            ->assertCreated()
            ->json('id');

        $listed = collect($this->getJson('/api/projects?type=flagship')->assertOk()->json())->firstWhere('id', $id);
        $this->assertSame('/storage/uploads/logo.png', $listed['logo']);
    }
}
