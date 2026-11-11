<?php

namespace App\Http\Controllers;

use App\Models\Insight;
use App\Models\Pillar;
use App\Models\Project;
use App\Models\Service;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * /sitemap.xml: every page search engines should index, at its one
 * canonical address on the main domain, with when it last changed.
 */
class SitemapController extends Controller
{
    /** Pages with fixed addresses, and how much they matter relative to each other. */
    private const PAGES = [
        '/' => 1.0,
        '/projects' => 0.9,
        '/projects/flagship' => 0.8,
        '/services' => 0.8,
        '/our-approach' => 0.7,
        '/insights' => 0.8,
        '/client-impact' => 0.7,
        '/about' => 0.7,
        '/contact' => 0.6,
        '/privacy' => 0.2,
        '/terms' => 0.2,
        '/cookies' => 0.2,
    ];

    public function __invoke()
    {
        $xml = Cache::remember('sitemap.xml', now()->addHour(), fn () => $this->build());

        return response($xml, 200)
            ->header('Content-Type', 'application/xml; charset=UTF-8')
            ->header('Cache-Control', 'public, max-age=3600');
    }

    private function build(): string
    {
        $origin = rtrim(config('app.frontend_url') ?: config('app.url'), '/');
        $urls = [];
        $add = function (string $path, $lastmod, float $priority) use (&$urls, $origin) {
            $urls[] = [$origin.($path === '/' ? '/' : $path), $lastmod ? Carbon::parse($lastmod)->toAtomString() : null, $priority];
        };

        $latest = collect([
            Project::max('updated_at'), Insight::max('updated_at'), Service::max('updated_at'), Pillar::max('updated_at'),
        ])->filter()->max();
        foreach (self::PAGES as $path => $priority) {
            $add($path, in_array($path, ['/privacy', '/terms', '/cookies'], true) ? null : $latest, $priority);
        }

        Project::where('is_active', true)->orderBy('order')->get(['slug', 'updated_at', 'type'])
            ->each(fn ($p) => $add('/projects/'.$p->slug, $p->updated_at, $p->type === 'flagship' ? 0.8 : 0.7));
        Insight::where('is_published', true)->orderByDesc('published_at')->get(['slug', 'updated_at'])
            ->each(fn ($i) => $add('/insights/'.$i->slug, $i->updated_at, 0.6));
        Service::where('is_active', true)->get(['slug', 'updated_at'])
            ->each(fn ($s) => $add('/services/'.$s->slug, $s->updated_at, 0.6));
        Pillar::where('is_active', true)->get(['slug', 'updated_at'])
            ->each(fn ($p) => $add('/our-approach/'.$p->slug, $p->updated_at, 0.5));

        $e = fn ($v) => htmlspecialchars((string) $v, ENT_XML1 | ENT_QUOTES, 'UTF-8');
        $body = collect($urls)->map(fn ($u) => '  <url><loc>'.$e($u[0]).'</loc>'.($u[1] ? '<lastmod>'.$e($u[1]).'</lastmod>' : '').'<priority>'.number_format($u[2], 1).'</priority></url>')->implode("\n");

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n{$body}\n</urlset>\n";
    }
}
