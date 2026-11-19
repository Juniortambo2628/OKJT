<?php

namespace Tests\Feature;

use App\Mail\SiteCheckReport;
use App\Models\SiteCheck;
use App\Models\Subscriber;
use App\Support\SiteCheck\RobotsTxt;
use App\Support\SiteCheck\SafeFetcher;
use App\Support\SiteCheck\SiteChecker;
use App\Support\SiteCheck\SiteCheckException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/** The website health check: what it may fetch, what it finds, and its endpoints. */
class SiteCheckTest extends TestCase
{
    use RefreshDatabase;

    /** Every name resolves to a public documentation-free address unless the test says otherwise. */
    private function fakeDns(array $map = []): void
    {
        $this->app->instance(SafeFetcher::class, new SafeFetcher(fn (string $host) => $map[$host] ?? ['93.184.216.34']));
    }

    private function goodPage(string $extraHead = '', string $body = ''): string
    {
        $words = str_repeat('Clinics in Nairobi use this platform to book patients and keep records. ', 20);

        return '<!doctype html><html lang="en"><head><title>Example Clinic | Patient bookings</title>'
            .'<meta name="viewport" content="width=device-width, initial-scale=1">'
            .'<meta name="description" content="Book a clinic appointment in Nairobi online, see your records and pay by M-Pesa.">'
            .'<link rel="canonical" href="https://example.com/">'
            .'<meta property="og:title" content="x"><meta property="og:description" content="x"><meta property="og:image" content="https://example.com/og.png">'
            .$extraHead.'</head><body><h1>Example Clinic</h1><p>'.$words.'</p>'.$body.'</body></html>';
    }

    private function statuses(array $report): array
    {
        return collect($report['checks'])->pluck('status', 'id')->all();
    }

    public function test_robots_txt_is_read_the_way_google_reads_it(): void
    {
        $robots = new RobotsTxt("User-agent: *\nDisallow: /admin\nDisallow: /api/\nAllow: /api/public\n\nUser-agent: Googlebot-Image\nDisallow: /\n\nSitemap: https://example.com/sitemap.xml");

        $this->assertTrue($robots->allows('/'));
        $this->assertFalse($robots->allows('/admin/login'));
        $this->assertFalse($robots->allows('/api/projects'));
        $this->assertTrue($robots->allows('/api/public/x'), 'the longer Allow wins');
        $this->assertFalse($robots->allows('/', 'googlebot-image'), 'the most specific agent group applies');
        $this->assertSame(['https://example.com/sitemap.xml'], $robots->sitemaps);

        $wild = new RobotsTxt("User-agent: *\nDisallow: /*.pdf$\nDisallow:");
        $this->assertFalse($wild->allows('/files/a.pdf'));
        $this->assertTrue($wild->allows('/files/a.pdf?x=1'));
    }

    public function test_only_public_addresses_count_as_public(): void
    {
        foreach (['127.0.0.1', '10.1.2.3', '172.16.0.1', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '::1', 'fd00::1', 'fe80::1', '::ffff:10.0.0.1', '224.0.0.1'] as $ip) {
            $this->assertFalse(SafeFetcher::isPublic($ip), $ip);
        }
        foreach (['93.184.216.34', '8.8.8.8', '2606:4700::1111'] as $ip) {
            $this->assertTrue(SafeFetcher::isPublic($ip), $ip);
        }
    }

    public function test_it_refuses_private_hosts_other_ports_and_schemes_before_connecting(): void
    {
        Http::fake();
        $fetcher = new SafeFetcher(fn ($host) => ['169.254.169.254']);
        foreach (['http://metadata.internal/', 'http://127.0.0.1/', 'https://example.com:8080/', 'ftp://example.com/', 'https://user:pw@example.com/'] as $url) {
            try {
                $fetcher->get($url);
                $this->fail("{$url} was fetched");
            } catch (SiteCheckException) {
                $this->addToAssertionCount(1);
            }
        }
        Http::assertNothingSent();
    }

    public function test_a_redirect_to_a_private_address_is_refused(): void
    {
        Http::fake(['https://example.com/' => Http::response('', 302, ['Location' => 'http://internal.example/'])]);
        $fetcher = new SafeFetcher(fn ($host) => $host === 'internal.example' ? ['10.0.0.5'] : ['93.184.216.34']);

        $this->expectException(SiteCheckException::class);
        $fetcher->get('https://example.com/');
    }

    public function test_a_healthy_page_passes(): void
    {
        $this->fakeDns();
        Http::fake([
            'https://example.com/robots.txt' => Http::response("User-agent: *\nDisallow: /admin\nSitemap: https://example.com/sitemap.xml"),
            'https://example.com/sitemap.xml' => Http::response('<urlset><url><loc>https://example.com/</loc></url><url><loc>https://example.com/b</loc></url></urlset>'),
            'https://www.example.com/' => Http::response('', 301, ['Location' => 'https://example.com/']),
            'https://example.com/' => Http::response($this->goodPage('<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization"}</script>')),
        ]);

        $report = $this->app->make(SiteChecker::class)->check('example.com');

        $this->assertSame('https://example.com/', $report['final_url']);
        $this->assertSame(0, $report['summary']['fail'], json_encode($report['checks']));
        $this->assertSame(0, $report['summary']['warn'], json_encode($report['checks']));
        $this->assertSame('pass', $this->statuses($report)['content-in-html']);
    }

    public function test_it_finds_what_okjtech_had_wrong(): void
    {
        // A JavaScript-only page, /api/ blocked in robots.txt, no canonical, www serving a copy.
        $this->fakeDns();
        Http::fake([
            'https://example.com/robots.txt' => Http::response("User-agent: *\nDisallow: /api/\nDisallow: /assets/"),
            'https://example.com/sitemap.xml' => Http::response('', 404),
            'https://www.example.com/' => Http::response('<html></html>'),
            'https://example.com/' => Http::response('<!doctype html><html><head><title>App</title><meta name="robots" content="noindex"><script src="/assets/app.js"></script></head><body><div id="root"></div></body></html>'),
        ]);

        $statuses = $this->statuses($this->app->make(SiteChecker::class)->check('https://example.com/'));

        $this->assertSame('fail', $statuses['robots-resources']);
        $this->assertSame('fail', $statuses['content-in-html']);
        $this->assertSame('fail', $statuses['noindex']);
        $this->assertSame('warn', $statuses['canonical']);
        $this->assertSame('warn', $statuses['sitemap']);
        $this->assertSame('warn', $statuses['one-host']);
        $this->assertSame('warn', $statuses['title']);
        $this->assertSame('fail', $statuses['viewport']);
        $this->assertSame('warn', $statuses['lang']);
    }

    public function test_the_endpoint_stores_a_report_and_serves_it(): void
    {
        $this->fakeDns();
        Http::fake(['https://example.com/' => Http::response($this->goodPage()), '*' => Http::response('', 404)]);

        $id = $this->postJson('/api/tools/site-check', ['url' => 'example.com'])
            ->assertCreated()
            ->assertJsonPath('data.url', 'https://example.com/')
            ->json('data.id');

        $this->getJson("/api/tools/site-check/{$id}")->assertOk()->assertJsonPath('data.report.final_url', 'https://example.com/');
        $this->assertSame('example.com', SiteCheck::find($id)->host);
    }

    public function test_the_endpoint_explains_an_address_it_may_not_check(): void
    {
        $this->fakeDns(['router.local' => ['192.168.0.1']]);
        Http::fake();

        $this->postJson('/api/tools/site-check', ['url' => 'http://router.local/'])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Only sites on the public internet can be checked.');
        Http::assertNothingSent();
    }

    public function test_checks_are_rate_limited(): void
    {
        $this->fakeDns(['router.local' => ['192.168.0.1']]);
        foreach (range(1, 5) as $i) {
            $this->postJson('/api/tools/site-check', ['url' => 'http://router.local/'])->assertStatus(422);
        }
        $this->postJson('/api/tools/site-check', ['url' => 'http://router.local/'])->assertStatus(429);
    }

    public function test_speed_scores_are_set_once_and_reports_expire(): void
    {
        $check = SiteCheck::create(['url' => 'https://example.com/', 'host' => 'example.com', 'report' => ['checks' => []]]);

        $this->postJson("/api/tools/site-check/{$check->id}/speed", ['performance' => 140])->assertStatus(422);
        $this->postJson("/api/tools/site-check/{$check->id}/speed", ['performance' => 91, 'seo' => 100])->assertOk()->assertJsonPath('data.speed.performance', 91);
        $this->postJson("/api/tools/site-check/{$check->id}/speed", ['performance' => 10])->assertOk()->assertJsonPath('data.speed.performance', 91);

        $check->forceFill(['created_at' => now()->subDays(31)])->save();
        $this->getJson("/api/tools/site-check/{$check->id}")->assertNotFound();
    }

    public function test_a_report_can_be_emailed_and_the_reader_subscribe(): void
    {
        Mail::fake();
        $check = SiteCheck::create(['url' => 'https://example.com/', 'host' => 'example.com', 'report' => ['checks' => [], 'summary' => ['pass' => 3, 'warn' => 1, 'fail' => 0]]]);

        $this->postJson("/api/tools/site-check/{$check->id}/email", ['email' => 'Owner@Example.com', 'subscribe' => true])->assertOk();
        $this->postJson("/api/tools/site-check/{$check->id}/email", ['email' => 'other@example.com'])->assertOk();

        Mail::assertSent(SiteCheckReport::class, 2);
        $this->assertSame('site-check', Subscriber::where('email', 'owner@example.com')->value('source'));
        $this->assertFalse(Subscriber::where('email', 'other@example.com')->exists(), 'no subscription without asking');
        $this->assertStringContainsString("/tools/site-check/{$check->id}", (new SiteCheckReport($check))->render());
    }

    public function test_the_tool_and_its_reports_are_pages(): void
    {
        $index = public_path('index.html');
        $original = is_file($index) ? file_get_contents($index) : null;
        file_put_contents($index, '<!doctype html><html><head><!--okjt:seo--><title>x</title><!--/okjt:seo--></head><body><div id="root"></div></body></html>');
        try {
            $this->get('/tools/site-check')->assertOk()->assertSee('<h1>Website health check</h1>', false)->assertSee('index, follow', false);
            $this->get('/tools/site-check/01JD5Q8Z2M3N4P5Q6R7S8T9V0W')->assertOk()->assertSee('noindex, nofollow', false);
            $this->get('/sitemap.xml')->assertSee('/tools/site-check</loc>', false);
        } finally {
            $original === null ? @unlink($index) : file_put_contents($index, $original);
        }
    }
}
