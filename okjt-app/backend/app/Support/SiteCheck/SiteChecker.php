<?php

namespace App\Support\SiteCheck;

use DOMDocument;
use DOMXPath;

/**
 * Checks one page the way a search engine first meets it: the address and
 * its redirects, robots.txt and the sitemap, the tags in the HTML the server
 * sends, and how much of the page is there before any JavaScript runs.
 * Each check says what was found and, when something is wrong, how to fix it
 * in plain words.
 */
class SiteChecker
{
    private array $checks = [];

    public function __construct(private SafeFetcher $fetcher) {}

    /**
     * @return array{url: string, final_url: string, status: int, checks: list<array>, summary: array{pass: int, warn: int, fail: int}}
     *
     * @throws SiteCheckException when the page itself can't be fetched
     */
    public function check(string $url): array
    {
        $this->checks = [];
        $url = self::normalise($url);
        $page = $this->fetcher->get($url);
        $final = $page['url'];
        $parts = parse_url($final);
        $origin = $parts['scheme'].'://'.$parts['host'];
        $path = ($parts['path'] ?? '/').(isset($parts['query']) ? '?'.$parts['query'] : '');

        $this->address($url, $page);
        $html = $this->html($page['body']);
        $xpath = new DOMXPath($html);

        $robots = $this->robots($origin, $path, $xpath, $final);
        $this->sitemap($origin, $robots);
        $this->otherHost($parts);
        $this->indexable($xpath, $page['headers']);
        $this->canonical($xpath, $final);
        $this->title($xpath);
        $this->description($xpath);
        $this->headings($xpath);
        $this->content($html);
        $this->basics($xpath);
        $this->sharing($xpath);
        $this->structuredData($xpath);

        $summary = ['pass' => 0, 'warn' => 0, 'fail' => 0];
        foreach ($this->checks as $check) {
            if (isset($summary[$check['status']])) {
                $summary[$check['status']]++;
            }
        }

        return ['url' => $url, 'final_url' => $final, 'status' => $page['status'], 'checks' => $this->checks, 'summary' => $summary];
    }

    /** "example.com" → "https://example.com/". */
    public static function normalise(string $url): string
    {
        $url = trim($url);
        if (! preg_match('#^[a-z][a-z0-9+.-]*://#i', $url)) {
            $url = 'https://'.$url;
        }
        $parts = parse_url($url);
        if (! $parts || empty($parts['host'])) {
            throw new SiteCheckException('That doesn’t look like a web address.');
        }

        return isset($parts['path']) ? $url : $url.'/';
    }

    private function add(string $group, string $id, string $title, string $status, string $detail, ?string $fix = null): void
    {
        $this->checks[] = compact('group', 'id', 'title', 'status', 'detail') + ['fix' => $status === 'pass' || $status === 'info' ? null : $fix];
    }

    private function address(string $asked, array $page): void
    {
        $final = $page['url'];
        $hops = count($page['redirects']);
        $https = str_starts_with($final, 'https://');

        $this->add('Setup', 'https', 'Served over HTTPS', $https ? 'pass' : 'fail',
            $https ? 'The page is served securely over HTTPS.' : 'The page is served over plain HTTP.',
            'Install a free certificate (Let’s Encrypt) and redirect every http:// address to https://.');

        $status = $page['status'];
        $this->add('Indexing', 'status', 'The page answers 200 OK', $status === 200 ? 'pass' : 'fail',
            "The server answered {$status}".($hops ? " after {$hops} redirect".($hops > 1 ? 's' : '') : '').'.',
            'A page meant for search results must answer 200. Fix the error, or point links and the sitemap at the page’s working address.');

        if ($hops > 0) {
            $chain = implode(' → ', array_merge([$page['redirects'][0]['from']], array_column($page['redirects'], 'to')));
            $permanent = collect($page['redirects'])->every(fn ($r) => in_array($r['status'], [301, 308], true));
            $this->add('Indexing', 'redirects', 'Redirects', $hops > 1 || ! $permanent ? 'warn' : 'pass',
                $chain.($permanent ? '' : ' (not all permanent)'),
                'Use one permanent (301) redirect straight to the final address, and link to the final address directly. Google reports pages reached this way as “Page with redirect”.');
        }
    }

    private function html(string $body): DOMDocument
    {
        $doc = new DOMDocument;
        $previous = libxml_use_internal_errors(true);
        $doc->loadHTML('<?xml encoding="UTF-8">'.($body !== '' ? $body : '<html></html>'));
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        return $doc;
    }

    private function robots(string $origin, string $path, DOMXPath $xpath, string $final): ?RobotsTxt
    {
        try {
            $response = $this->fetcher->get($origin.'/robots.txt');
        } catch (SiteCheckException) {
            $response = null;
        }
        if (! $response || $response['status'] !== 200) {
            $this->add('Indexing', 'robots', 'robots.txt', 'warn', 'There is no robots.txt file.',
                'Add /robots.txt with “User-agent: *”, the paths to keep out (such as /admin), and a “Sitemap:” line.');

            return null;
        }
        $robots = new RobotsTxt($response['body']);

        $pageAllowed = $robots->allows($path);
        $this->add('Indexing', 'robots', 'robots.txt lets Google in', $pageAllowed ? 'pass' : 'fail',
            $pageAllowed ? 'robots.txt allows Google to crawl this page.' : 'robots.txt blocks Google from this page.',
            'Remove the Disallow rule that matches this page, unless it is meant to stay out of search.');

        // What the page loads from its own site: a blocked script, stylesheet or data
        // address means Google renders the page without it (often an empty page).
        $host = parse_url($final, PHP_URL_HOST);
        $blocked = [];
        foreach ($xpath->query('//script[@src]/@src | //link[@rel="stylesheet"]/@href | //img[@src]/@src') as $attr) {
            $address = SafeFetcher::absolute($attr->value, $final);
            if (parse_url($address, PHP_URL_HOST) !== $host) {
                continue;
            }
            $resource = (parse_url($address, PHP_URL_PATH) ?: '/').(($q = parse_url($address, PHP_URL_QUERY)) ? '?'.$q : '');
            if (! $robots->allows($resource)) {
                $blocked[] = $resource;
            }
        }
        $blocked = array_values(array_unique($blocked));
        // Data addresses apps commonly load from: a blocked one may leave Google an empty page.
        $data = array_values(array_filter(['/api/', '/wp-json/', '/graphql'], fn ($p) => ! $robots->allows($p)));
        $this->add('Indexing', 'robots-resources', 'Google can load what the page needs', $blocked ? 'fail' : ($data ? 'warn' : 'pass'),
            match (true) {
                (bool) $blocked => 'robots.txt blocks files this page loads: '.implode(', ', array_slice($blocked, 0, 6)).(count($blocked) > 6 ? '…' : '').'.',
                (bool) $data => 'robots.txt blocks '.implode(', ', $data).'. If pages load their words from there, Google sees them empty.',
                default => 'No script, stylesheet or image the page loads from its own site is blocked.',
            },
            'Google renders pages with the same files and data a browser loads. Remove these Disallow rules (keep data out of results with an “X-Robots-Tag: noindex” header instead), or the page Google sees may be missing its content and look like a duplicate.');

        return $robots;
    }

    private function sitemap(string $origin, ?RobotsTxt $robots): void
    {
        $listed = $robots?->sitemaps ?? [];
        $address = $listed[0] ?? $origin.'/sitemap.xml';
        try {
            $response = $this->fetcher->get($address);
        } catch (SiteCheckException) {
            $response = null;
        }
        $count = $response && $response['status'] === 200 ? substr_count(strtolower($response['body']), '<loc>') : 0;
        if ($count === 0) {
            $this->add('Indexing', 'sitemap', 'Sitemap', 'warn', 'No sitemap was found at '.$address.'.',
                'Publish /sitemap.xml listing every page you want in search, name it in robots.txt (“Sitemap: …”), and submit it in Google Search Console.');

            return;
        }
        $this->add('Indexing', 'sitemap', 'Sitemap', $listed ? 'pass' : 'warn',
            "The sitemap lists {$count} address".($count === 1 ? '' : 'es').($listed ? ' and is named in robots.txt.' : ', but robots.txt doesn’t name it.'),
            'Add a “Sitemap: '.$address.'” line to robots.txt.');
    }

    /** The www and non-www hosts should be one site: the other one redirects here. */
    private function otherHost(array $parts): void
    {
        $host = $parts['host'];
        if (filter_var($host, FILTER_VALIDATE_IP) || substr_count($host, '.') < 1) {
            return;
        }
        $other = str_starts_with($host, 'www.') ? substr($host, 4) : 'www.'.$host;
        try {
            $response = $this->fetcher->get($parts['scheme'].'://'.$other.'/');
        } catch (SiteCheckException) {
            return; // The other name doesn't exist or doesn't answer: nothing to merge.
        }
        $lands = parse_url($response['url'], PHP_URL_HOST);
        $ok = $lands === $host;
        $this->add('Indexing', 'one-host', 'One address for the site', $ok ? 'pass' : 'warn',
            $ok ? "{$other} redirects to {$host}." : "{$other} shows the site without redirecting to {$host}, so search engines see two copies.",
            "Redirect every address on {$other} permanently (301) to the same address on {$host}.");
    }

    private function indexable(DOMXPath $xpath, array $headers): void
    {
        $meta = strtolower($this->attr($xpath, '//meta[@name="robots" or @name="googlebot"]/@content') ?? '');
        $header = strtolower($headers['x-robots-tag'] ?? '');
        $noindex = str_contains($meta, 'noindex') || str_contains($header, 'noindex');
        $this->add('Indexing', 'noindex', 'Allowed in search results', $noindex ? 'fail' : 'pass',
            $noindex ? 'The page asks search engines not to index it ('.($meta ? 'meta robots: '.$meta : 'X-Robots-Tag: '.$header).').' : 'Nothing asks search engines to leave this page out.',
            'Remove “noindex” from the robots meta tag or the X-Robots-Tag header, unless the page should stay out of search.');
    }

    private function canonical(DOMXPath $xpath, string $final): void
    {
        $tags = $xpath->query('//link[@rel="canonical"]/@href');
        if ($tags->length === 0) {
            $this->add('Indexing', 'canonical', 'Canonical address', 'warn', 'The page doesn’t say which address is its main one.',
                'Add <link rel="canonical" href="…"> with the page’s own full address. Without it Google picks one, and reports the rest as “Duplicate without user-selected canonical”.');

            return;
        }
        if ($tags->length > 1) {
            $this->add('Indexing', 'canonical', 'Canonical address', 'fail', "The page has {$tags->length} canonical tags; Google ignores them all.",
                'Keep exactly one canonical tag.');

            return;
        }
        $href = trim($tags->item(0)->value);
        $absolute = SafeFetcher::absolute($href, $final);
        $same = rtrim(strtok($absolute, '#'), '/') === rtrim(strtok($final, '?#'), '/');
        $this->add('Indexing', 'canonical', 'Canonical address', $same ? 'pass' : 'warn',
            $same ? 'The canonical tag points to this page.' : "The canonical tag points elsewhere: {$absolute}.",
            'If this page should be in search under its own address, point its canonical tag at itself.');
    }

    private function title(DOMXPath $xpath): void
    {
        $title = trim($xpath->query('//title')->item(0)?->textContent ?? '');
        $length = mb_strlen($title);
        [$status, $detail] = match (true) {
            $length === 0 => ['fail', 'The page has no title.'],
            $length < 15 => ['warn', "The title is short ({$length} characters): “{$title}”."],
            $length > 65 => ['warn', "The title is long ({$length} characters) and will be cut off: “{$title}”."],
            default => ['pass', "“{$title}” ({$length} characters)."],
        };
        $this->add('Content', 'title', 'Page title', $status, $detail,
            'Give every page its own title of 15 to 65 characters: what the page is, then the site’s name.');
    }

    private function description(DOMXPath $xpath): void
    {
        $text = trim($this->attr($xpath, '//meta[@name="description"]/@content') ?? '');
        $length = mb_strlen($text);
        [$status, $detail] = match (true) {
            $length === 0 => ['warn', 'The page has no meta description, so Google writes its own snippet.'],
            $length < 50 => ['warn', "The description is short ({$length} characters)."],
            $length > 165 => ['warn', "The description is long ({$length} characters) and will be cut off."],
            default => ['pass', "{$length} characters: “".mb_strimwidth($text, 0, 120, '…').'”'],
        };
        $this->add('Content', 'description', 'Meta description', $status, $detail,
            'Write one or two sentences (50 to 160 characters) saying what the page offers, different on every page.');
    }

    private function headings(DOMXPath $xpath): void
    {
        $count = $xpath->query('//h1')->length;
        $this->add('Content', 'h1', 'One main heading', $count === 1 ? 'pass' : 'warn',
            match (true) {
                $count === 0 => 'There is no <h1> in the HTML the server sends.',
                $count === 1 => 'The page has one <h1>: “'.mb_strimwidth(trim($xpath->query('//h1')->item(0)->textContent), 0, 80, '…').'”.',
                default => "The page has {$count} <h1> headings.",
            },
            'Give the page one <h1> saying what it is about, in the HTML the server sends.');
    }

    /** How many words a reader that doesn't run JavaScript gets. */
    private function content(DOMDocument $html): void
    {
        $copy = clone $html;
        foreach (['script', 'style', 'noscript', 'template', 'svg'] as $tag) {
            foreach (iterator_to_array($copy->getElementsByTagName($tag)) as $node) {
                $node->parentNode->removeChild($node);
            }
        }
        $text = trim(preg_replace('/\s+/u', ' ', $copy->getElementsByTagName('body')->item(0)?->textContent ?? ''));
        $words = $text === '' ? 0 : count(preg_split('/\s+/u', $text));
        $this->add('Content', 'content-in-html', 'Content in the HTML', $words >= 150 ? 'pass' : ($words >= 40 ? 'warn' : 'fail'),
            "The HTML the server sends has about {$words} words before any JavaScript runs.",
            'Send the page’s main text in the HTML (server-side rendering, pre-rendering, or the text written into the page). Pages that only fill in with JavaScript are slower to index and are often reported as “Crawled, currently not indexed”.');
    }

    private function basics(DOMXPath $xpath): void
    {
        $lang = $this->attr($xpath, '//html/@lang');
        $this->add('Setup', 'lang', 'Language declared', $lang ? 'pass' : 'warn',
            $lang ? "The page declares its language: {$lang}." : 'The page doesn’t declare its language.',
            'Add lang to the <html> tag, e.g. <html lang="en">.');

        $viewport = $this->attr($xpath, '//meta[@name="viewport"]/@content');
        $this->add('Setup', 'viewport', 'Built for phones', $viewport ? 'pass' : 'fail',
            $viewport ? 'The page has a mobile viewport.' : 'The page has no viewport tag, so phones show it zoomed out.',
            'Add <meta name="viewport" content="width=device-width, initial-scale=1">.');
    }

    private function sharing(DOMXPath $xpath): void
    {
        $missing = array_values(array_filter(['og:title', 'og:description', 'og:image'], fn ($p) => ! $this->attr($xpath, "//meta[@property=\"{$p}\"]/@content")));
        $this->add('Sharing', 'open-graph', 'Link previews', $missing ? 'warn' : 'pass',
            $missing ? 'Missing: '.implode(', ', $missing).'. Links shared on WhatsApp, LinkedIn and X will show a plain preview.' : 'Title, description and image are set for link previews.',
            'Add the Open Graph tags og:title, og:description and og:image (1200 × 630 px) to every page.');
    }

    private function structuredData(DOMXPath $xpath): void
    {
        $types = [];
        foreach ($xpath->query('//script[@type="application/ld+json"]') as $script) {
            $data = json_decode($script->textContent, true);
            foreach (isset($data['@graph']) ? $data['@graph'] : [$data] as $item) {
                if (is_array($item) && isset($item['@type'])) {
                    $types[] = is_array($item['@type']) ? implode('/', $item['@type']) : $item['@type'];
                }
            }
        }
        $this->add('Sharing', 'structured-data', 'Structured data', $types ? 'pass' : 'info',
            $types ? 'Found: '.implode(', ', array_unique($types)).'.' : 'No structured data (schema.org). Optional, but it can earn richer search results, such as articles, products, reviews or your business details.');
    }

    private function attr(DOMXPath $xpath, string $query): ?string
    {
        $node = $xpath->query($query)->item(0);

        return $node ? trim($node->nodeValue) : null;
    }
}
