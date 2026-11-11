<?php

namespace App\Http\Controllers;

use App\Models\Insight;
use App\Models\Pillar;
use App\Models\Project;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Answers every page of the site (okjt-app/web, built into public/) with
 * its index.html, after writing that page's title, description and Open
 * Graph tags into it, so search engines and link previews read each page
 * without running its JavaScript. The API itself stays under /api.
 */
class SpaController extends Controller
{
    private const SITE = 'OKJTech';

    private const DEFAULT_TITLE = 'OKJTech — Design-led Web Engineering';

    private const DEFAULT_DESCRIPTION = 'Web applications for health, legal, construction, events, commerce and nonprofit organisations, designed and built end to end in Nairobi, Kenya.';

    /** Pages with fixed words: path => [title, description]. */
    private const PAGES = [
        '/' => [self::DEFAULT_TITLE, self::DEFAULT_DESCRIPTION],
        '/about' => ['About', 'A web engineering studio in Nairobi taking platforms from first idea to a live, supported system.'],
        '/services' => ['Services', 'Web application engineering, e-commerce, dashboards, interface design and technical strategy.'],
        '/projects' => ['Projects', 'Web platforms for health, law, construction, events, commerce and nonprofits, built end to end.'],
        '/projects/flagship' => ['Flagship projects', 'Products developed and owned by OKJTechnologies.'],
        '/our-approach' => ['Our approach', 'Six principles guide every project, from the first sketch to a platform that keeps growing.'],
        '/client-impact' => ['Client impact', 'Platforms in daily use by clinics, law firms, workshops, event companies and nonprofits.'],
        '/insights' => ['Insights', 'Notes on building web platforms that people rely on.'],
        '/contact' => ['Contact', 'Describe the platform, the people it should serve and the timeline.'],
        '/privacy' => ['Privacy policy', self::DEFAULT_DESCRIPTION],
        '/terms' => ['Terms of service', self::DEFAULT_DESCRIPTION],
        '/cookies' => ['Cookie policy', self::DEFAULT_DESCRIPTION],
    ];

    public function __invoke(Request $request)
    {
        // api.okjtech.co.ke is for the API: its pages live on the main domain.
        $frontend = config('app.frontend_url');
        $frontendHost = parse_url($frontend, PHP_URL_HOST);
        // www.okjtech.co.ke is the same site: one address per page for search engines.
        if ($frontendHost && $request->getHost() !== $frontendHost && Str::startsWith($request->getHost(), ['api.', 'www.'])) {
            return redirect()->away(rtrim($frontend, '/').$request->getRequestUri(), 301);
        }

        // The old site's portfolio addresses live on as the projects pages.
        if (preg_match('#^portfolio(?:/([^/]+))?/?$#', $request->path(), $m)) {
            return redirect('/projects'.(isset($m[1]) ? '/'.$m[1] : ''), 301);
        }

        $index = public_path('index.html');
        if (! is_file($index)) {
            abort(404, 'The site has not been built: run npm run build in okjt-app/web.');
        }

        $path = '/'.trim($request->path(), '/');
        [$meta, $status] = $this->metaFor($path);
        $html = $this->inject(file_get_contents($index), $meta, rtrim($frontend ?: $request->root(), '/').($path === '/' ? '/' : $path), $this->structuredData($path));

        return response($html, $status)
            ->header('Content-Type', 'text/html; charset=UTF-8')
            ->header('Cache-Control', 'no-cache');
    }

    /** [title, description, image, indexable] for a path, and the status to answer with. */
    private function metaFor(string $path): array
    {
        if (isset(self::PAGES[$path])) {
            [$title, $description] = self::PAGES[$path];

            return [[$path === '/' ? $title : $title.' | '.self::SITE, $description, null, true], 200];
        }

        if (Str::startsWith($path, '/admin')) {
            return [['Dashboard | '.self::SITE, self::DEFAULT_DESCRIPTION, null, false], 200];
        }

        $record = null;
        if (preg_match('#^/services/([^/]+)$#', $path, $m)) {
            $record = Service::where('slug', $m[1])->where('is_active', true)->first();
            $record = $record ? [$record->title, $record->description, $record->image] : false;
        } elseif (preg_match('#^/insights/([^/]+)$#', $path, $m)) {
            $record = Insight::where('slug', $m[1])->where('is_published', true)->first();
            $record = $record ? [$record->title, $record->excerpt ?: $record->content, $record->image] : false;
        } elseif (preg_match('#^/projects/([^/]+)$#', $path, $m)) {
            $record = Project::where('slug', $m[1])->where('is_active', true)->first();
            $record = $record ? [$record->title, $record->tagline ?: $record->description, $record->bg_image ?: $record->image] : false;
        } elseif (preg_match('#^/our-approach/([^/]+)$#', $path, $m)) {
            $record = Pillar::where('slug', $m[1])->where('is_active', true)->first();
            $record = $record ? [$record->title, $record->overview, $record->image] : false;
        }

        if (is_array($record)) {
            [$title, $description, $image] = $record;

            return [[$title.' | '.self::SITE, $description ?: self::DEFAULT_DESCRIPTION, $image, true], 200];
        }

        // Not a page of the site: the app shows its "not found" page.
        return [['Page not found | '.self::SITE, self::DEFAULT_DESCRIPTION, null, false], 404];
    }

    /**
     * schema.org data for an article or a case study, so search engines can
     * show them as such (the studio itself is described in index.html).
     */
    private function structuredData(string $path): ?array
    {
        $origin = rtrim(config('app.frontend_url'), '/');
        $publisher = ['@type' => 'Organization', 'name' => 'OKJTechnologies', 'url' => $origin.'/', 'logo' => ['@type' => 'ImageObject', 'url' => $origin.'/logos/OKJT-Logos/OKJTechLogo-Black_Transparent.png']];

        if (preg_match('#^/insights/([^/]+)$#', $path, $m) && ($insight = Insight::where('slug', $m[1])->where('is_published', true)->first())) {
            return array_filter([
                '@context' => 'https://schema.org',
                '@type' => 'Article',
                'headline' => Str::limit($insight->title, 110, ''),
                'description' => Str::limit(trim(strip_tags((string) ($insight->excerpt ?: $insight->content))), 300),
                'image' => $insight->image ? [$this->absolute($insight->image)] : null,
                'datePublished' => optional($insight->published_at ?: $insight->created_at)->toAtomString(),
                'dateModified' => optional($insight->updated_at)->toAtomString(),
                'author' => $publisher,
                'publisher' => $publisher,
                'articleSection' => $insight->category,
                'mainEntityOfPage' => $origin.$path,
            ]);
        }

        if (preg_match('#^/projects/([^/]+)$#', $path, $m) && ($project = Project::where('slug', $m[1])->where('is_active', true)->first())) {
            $images = array_values(array_filter([$project->bg_image ?: $project->image, ...array_slice((array) $project->gallery, 0, 4)]));

            return array_filter([
                '@context' => 'https://schema.org',
                '@type' => 'CreativeWork',
                'name' => $project->title,
                'description' => Str::limit(trim(strip_tags((string) ($project->tagline ?: $project->description))), 300),
                'image' => $images ? array_map(fn ($i) => $this->absolute($i), $images) : null,
                'url' => $project->url ?: null,
                'creator' => $publisher,
                'keywords' => $project->category,
                'mainEntityOfPage' => $origin.$path,
            ]);
        }

        return null;
    }

    private function inject(string $html, array $meta, string $canonical, ?array $data = null): string
    {
        [$title, $description, $image, $indexable] = $meta;
        $description = Str::limit(trim(preg_replace('/\s+/', ' ', strip_tags((string) $description))), 160);
        $image = $this->absolute($image ?: '/logos/OKJT-Logos/OKJTechLogo-Black_BG.png');
        $e = fn ($value) => htmlspecialchars((string) $value, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        $tags = implode("\n    ", [
            '<title>'.$e($title).'</title>',
            '<meta name="description" content="'.$e($description).'" />',
            '<meta name="robots" content="'.($indexable ? 'index, follow' : 'noindex, nofollow').'" />',
            '<link rel="canonical" href="'.$e($canonical).'" />',
            '<meta property="og:type" content="'.($data && $data['@type'] === 'Article' ? 'article' : 'website').'" />',
            '<meta property="og:site_name" content="'.self::SITE.'" />',
            '<meta property="og:title" content="'.$e($title).'" />',
            '<meta property="og:description" content="'.$e($description).'" />',
            '<meta property="og:url" content="'.$e($canonical).'" />',
            '<meta property="og:image" content="'.$e($image).'" />',
            '<meta property="og:locale" content="en_KE" />',
            '<meta name="twitter:card" content="summary_large_image" />',
            '<meta name="twitter:title" content="'.$e($title).'" />',
            '<meta name="twitter:description" content="'.$e($description).'" />',
            '<meta name="twitter:image" content="'.$e($image).'" />',
            ...($data ? ['<script type="application/ld+json">'.json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG).'</script>'] : []),
        ]);

        $replaced = preg_replace('#<!--okjt:seo-->.*?<!--/okjt:seo-->#s', $tags, $html, 1, $count);

        return $count ? $replaced : str_replace('</head>', "    {$tags}\n  </head>", $html);
    }

    /** An absolute address for a stored image, for link previews. */
    private function absolute(string $path): string
    {
        $origin = rtrim(config('app.frontend_url'), '/');
        if (preg_match('#^https?://[^/]+(?:/api)?/storage/(.+)$#', $path, $m)) {
            return $origin.'/storage/'.$m[1];
        }
        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }
        $clean = ltrim($path, '/');
        if (Str::startsWith($clean, ['assets/', 'logos/', 'storage/'])) {
            return $origin.'/'.$clean;
        }

        return $origin.'/storage/'.$clean;
    }
}
