<?php

namespace App\Support;

use App\Models\Insight;
use App\Models\Pillar;
use App\Models\Project;
use App\Models\Service;
use DOMDocument;
use DOMElement;
use DOMNode;

/**
 * Each page's main words and links as plain HTML, written into index.html's
 * #root by SpaController. Search engines and link previews that don't run
 * JavaScript read the page from it, and it gives them every page's links.
 * Visitors don't see it: it is hidden while JavaScript runs, and React
 * replaces it when the app starts.
 */
class PageContent
{
    /** The site's main pages, as the header and footer link to them. */
    private const NAV = [
        '/' => 'Home',
        '/services' => 'Services',
        '/projects' => 'Projects',
        '/our-approach' => 'Our approach',
        '/client-impact' => 'Client impact',
        '/insights' => 'Insights',
        '/about' => 'About',
        '/contact' => 'Contact',
    ];

    /** Tags kept from text written in the dashboard; every attribute but a safe href is dropped. */
    private const ALLOWED = ['p', 'br', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'a', 'h2', 'h3', 'h4', 'blockquote', 'figure', 'figcaption'];

    /**
     * The HTML for a path, or null for one with nothing to show (the
     * dashboard, a missing page).
     *
     * @param  array{0: string, 1: string}|null  $fixed  [title, description] of a page with fixed words
     */
    public function for(string $path, ?array $fixed = null): ?string
    {
        $main = $this->main($path, $fixed);

        return $main === null ? null : $this->nav().'<main>'.$main.'</main>';
    }

    private function main(string $path, ?array $fixed): ?string
    {
        if (preg_match('#^/projects/([^/]+)$#', $path, $m) && $m[1] !== 'flagship') {
            $project = Project::where('slug', $m[1])->where('is_active', true)->first();

            return $project ? $this->project($project) : null;
        }
        if (preg_match('#^/insights/([^/]+)$#', $path, $m)) {
            $insight = Insight::where('slug', $m[1])->where('is_published', true)->first();

            return $insight ? $this->insight($insight) : null;
        }
        if (preg_match('#^/services/([^/]+)$#', $path, $m)) {
            $service = Service::where('slug', $m[1])->where('is_active', true)->first();

            return $service ? $this->article($service->title, $service->category, $service->description, $service->content) : null;
        }
        if (preg_match('#^/our-approach/([^/]+)$#', $path, $m)) {
            $pillar = Pillar::where('slug', $m[1])->where('is_active', true)->first();

            return $pillar ? $this->pillar($pillar) : null;
        }
        if ($fixed === null) {
            return null;
        }

        [$title, $description] = $fixed;
        $intro = '<h1>'.$this->e($title).'</h1><p>'.$this->e($description).'</p>';

        return $intro.match ($path) {
            '/' => $this->home(),
            '/projects' => $this->projectList(Project::where('is_active', true)),
            '/projects/flagship' => $this->projectList(Project::where('is_active', true)->where('type', 'flagship')),
            '/services' => $this->links(Service::where('is_active', true)->orderBy('id')->get(), '/services/', 'description'),
            '/our-approach' => $this->links(Pillar::where('is_active', true)->orderBy('id')->get(), '/our-approach/', 'overview'),
            '/insights' => $this->insightList(Insight::where('is_published', true)->orderByDesc('published_at')->get()),
            default => '',
        };
    }

    private function home(): string
    {
        return '<h2>Flagship projects</h2>'.$this->projectList(Project::where('is_active', true)->where('type', 'flagship'))
            .'<h2>Services</h2>'.$this->links(Service::where('is_active', true)->orderBy('id')->get(), '/services/', 'description')
            .'<h2>Latest insights</h2>'.$this->insightList(Insight::where('is_published', true)->orderByDesc('published_at')->limit(3)->get());
    }

    private function project(Project $project): string
    {
        $facts = array_filter([
            'Client' => $project->client_name,
            'Sector' => $project->category,
            'Technologies' => implode(', ', array_filter((array) $project->technologies)),
        ]);

        $html = '<article><h1>'.$this->e($project->title).'</h1>';
        $html .= $project->tagline ? '<p>'.$this->e($project->tagline).'</p>' : '';
        if ($facts) {
            $html .= '<dl>';
            foreach ($facts as $label => $value) {
                $html .= '<dt>'.$label.'</dt><dd>'.$this->e($value).'</dd>';
            }
            $html .= '</dl>';
        }
        $html .= $this->text($project->description);
        foreach (['The challenge' => $project->problem, 'The approach' => $project->methodology, 'The outcome' => $project->outcome] as $heading => $text) {
            $html .= $this->blank($text) ? '' : '<h2>'.$heading.'</h2>'.$this->text($text);
        }
        if (! $this->blank($project->testimonial_quote)) {
            $html .= '<blockquote><p>'.$this->e(strip_tags($project->testimonial_quote)).'</p>'
                .($project->testimonial_author ? '<footer>'.$this->e($project->testimonial_author).'</footer>' : '').'</blockquote>';
        }
        $html .= $this->safeHref($project->url) ? '<p><a href="'.$this->e($project->url).'">Visit '.$this->e($project->title).'</a></p>' : '';

        return $html.'<p><a href="/projects">All projects</a></p></article>';
    }

    private function insight(Insight $insight): string
    {
        $date = $insight->published_at ?: $insight->created_at;
        $html = '<article><h1>'.$this->e($insight->title).'</h1>';
        $html .= $insight->category ? '<p>'.$this->e($insight->category).'</p>' : '';
        $html .= $date ? '<p><time datetime="'.$date->toDateString().'">'.$date->format('j F Y').'</time></p>' : '';
        $html .= $this->blank($insight->excerpt) ? '' : '<p>'.$this->e(strip_tags($insight->excerpt)).'</p>';

        return $html.$this->text($insight->content).'<p><a href="/insights">All insights</a></p></article>';
    }

    private function pillar(Pillar $pillar): string
    {
        $html = $this->article($pillar->title, null, $pillar->overview, $pillar->content, false);
        $services = $pillar->services()->where('is_active', true)->orderBy('id')->get();
        if ($services->isNotEmpty()) {
            $html .= '<h2>Services</h2>'.$this->links($services, '/services/', 'description');
        }

        return $html.'<p><a href="/our-approach">Our approach</a></p></article>';
    }

    private function article(string $title, ?string $label, ?string $summary, ?string $body, bool $close = true): string
    {
        $html = '<article><h1>'.$this->e($title).'</h1>';
        $html .= $label ? '<p>'.$this->e($label).'</p>' : '';
        $html .= $this->blank($summary) ? '' : '<p>'.$this->e(strip_tags($summary)).'</p>';
        $html .= $this->text($body);

        return $close ? $html.'</article>' : $html;
    }

    private function projectList($query): string
    {
        return $this->links($query->orderBy('order')->get(), '/projects/', 'tagline');
    }

    private function insightList($insights): string
    {
        return $this->links($insights, '/insights/', 'excerpt');
    }

    /** A list of links to records, each with its one-line summary. */
    private function links($records, string $prefix, string $summary): string
    {
        if ($records->isEmpty()) {
            return '';
        }
        $items = $records->map(function ($record) use ($prefix, $summary) {
            $text = trim(strip_tags((string) $record->{$summary}));

            return '<li><a href="'.$this->e($prefix.$record->slug).'">'.$this->e($record->title).'</a>'
                .($text !== '' ? ' — '.$this->e($text) : '').'</li>';
        });

        return '<ul>'.$items->implode('').'</ul>';
    }

    private function nav(): string
    {
        $links = collect(self::NAV)->map(fn ($label, $href) => '<li><a href="'.$href.'">'.$label.'</a></li>')->implode('');

        return '<nav aria-label="Main"><ul>'.$links.'</ul></nav>';
    }

    /** Text written in the dashboard: its HTML cut down to safe tags, or plain text as paragraphs. */
    private function text(?string $value): string
    {
        if ($this->blank($value)) {
            return '';
        }
        if ($value === strip_tags($value)) {
            return collect(preg_split('/\n\s*\n/', trim($value)))
                ->map(fn ($p) => '<p>'.nl2br($this->e(trim($p)), false).'</p>')->implode('');
        }

        return $this->sanitize($value);
    }

    private function sanitize(string $html): string
    {
        $doc = new DOMDocument;
        $previous = libxml_use_internal_errors(true);
        $doc->loadHTML('<?xml encoding="UTF-8"><div id="okjt-content">'.$html.'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $root = $doc->getElementById('okjt-content');
        if (! $root) {
            return '<p>'.$this->e(strip_tags($html)).'</p>';
        }
        $this->clean($root);

        $out = '';
        foreach ($root->childNodes as $child) {
            $out .= $doc->saveHTML($child);
        }

        return $out;
    }

    /** Drops scripts and styles, unwraps tags not allowed, and strips attributes but a safe href. */
    private function clean(DOMNode $node): void
    {
        foreach (iterator_to_array($node->childNodes) as $child) {
            if (! $child instanceof DOMElement) {
                if ($child->nodeType === XML_COMMENT_NODE) {
                    $node->removeChild($child);
                }

                continue;
            }
            $tag = strtolower($child->tagName);
            if (in_array($tag, ['script', 'style', 'iframe', 'object', 'embed', 'template', 'noscript', 'svg', 'math', 'form'], true)) {
                $node->removeChild($child);

                continue;
            }
            $this->clean($child);
            if (! in_array($tag, self::ALLOWED, true)) {
                while ($child->firstChild) {
                    $node->insertBefore($child->firstChild, $child);
                }
                $node->removeChild($child);

                continue;
            }
            $href = $tag === 'a' ? $child->getAttribute('href') : '';
            foreach (iterator_to_array($child->attributes) as $attribute) {
                $child->removeAttribute($attribute->name);
            }
            if ($tag === 'a' && $this->safeHref($href)) {
                $child->setAttribute('href', $href);
            }
        }
    }

    private function safeHref(?string $href): bool
    {
        return (bool) preg_match('#^(https?://|/(?!/)|mailto:)#i', trim((string) $href));
    }

    private function blank(?string $value): bool
    {
        return trim(strip_tags((string) $value)) === '';
    }

    private function e(?string $value): string
    {
        return htmlspecialchars((string) $value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
}
