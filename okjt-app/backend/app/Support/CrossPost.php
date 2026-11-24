<?php

namespace App\Support;

use App\Models\Insight;
use DOMDocument;
use DOMXPath;
use Illuminate\Support\Str;
use League\HTMLToMarkdown\HtmlConverter;

/**
 * An insight ready to post on other sites while okjtech.co.ke keeps the
 * credit: the original address as the canonical where the site supports
 * one (DEV, Hashnode), and a "first published on okjtech.co.ke" line in
 * every copy. Used by the RSS feed and the dashboard's Cross-post panel.
 */
class CrossPost
{
    public function __construct(private Insight $insight) {}

    /** The article's own address: the canonical every copy points back to. */
    public function url(): string
    {
        return SiteUrl::page('/insights/'.$this->insight->slug);
    }

    /** The article as HTML with full addresses for images and links, and the credit line at the end. */
    public function html(): string
    {
        return $this->absolutise((string) $this->insight->content)
            .'<p><em>First published on <a href="'.e($this->url()).'">okjtech.co.ke</a>.</em></p>';
    }

    public function markdown(): string
    {
        $converter = new HtmlConverter(['strip_tags' => true, 'header_style' => 'atx', 'hard_break' => true, 'remove_nodes' => 'script style iframe']);

        return trim($converter->convert($this->html()))."\n";
    }

    /** For DEV (dev.to): its front matter carries the canonical address, so a pasted post credits okjtech.co.ke. */
    public function devto(): string
    {
        $front = array_filter([
            'title' => $this->yaml($this->insight->title),
            'published' => 'false',
            'description' => $this->insight->excerpt ? $this->yaml(Str::limit(strip_tags($this->insight->excerpt), 150)) : null,
            'tags' => implode(', ', $this->tags()) ?: null,
            'cover_image' => $this->insight->image ? SiteUrl::absolute($this->insight->image) : null,
            'canonical_url' => $this->url(),
        ]);
        $lines = array_map(fn ($key, $value) => "{$key}: {$value}", array_keys($front), $front);

        return "---\n".implode("\n", $lines)."\n---\n\n".$this->markdown();
    }

    /** For Hashnode: the title and Markdown; the canonical address goes in the article's settings. */
    public function hashnode(): string
    {
        return '# '.$this->insight->title."\n\n".$this->markdown();
    }

    /**
     * For LinkedIn: a short post that sends readers to the article, rather
     * than a full copy (LinkedIn has no canonical setting).
     */
    public function linkedin(): string
    {
        $summary = trim(preg_replace('/\s+/', ' ', strip_tags((string) ($this->insight->excerpt ?: Str::limit(strip_tags((string) $this->insight->content), 280)))));

        return trim($this->insight->title."\n\n".$summary)."\n\nRead the full article: ".$this->url();
    }

    /** DEV allows up to four tags of letters and numbers: the topic's words, joined. */
    public function tags(): array
    {
        $topic = Str::lower(preg_replace('/[^A-Za-z0-9]/', '', (string) $this->insight->category));

        return $topic === '' ? [] : [Str::limit($topic, 30, '')];
    }

    public function toArray(): array
    {
        return [
            'url' => $this->url(),
            'devto' => $this->devto(),
            'hashnode' => $this->hashnode(),
            'linkedin' => $this->linkedin(),
        ];
    }

    private function yaml(string $value): string
    {
        return '"'.str_replace(['\\', '"'], ['\\\\', '\\"'], trim(preg_replace('/\s+/', ' ', strip_tags($value)))).'"';
    }

    /** Images and links in the article written as full okjtech.co.ke addresses, so they work on other sites. */
    private function absolutise(string $html): string
    {
        if (trim($html) === '') {
            return '';
        }
        $doc = new DOMDocument;
        libxml_use_internal_errors(true);
        $doc->loadHTML('<?xml encoding="utf-8"?><div id="crosspost">'.$html.'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();
        $xpath = new DOMXPath($doc);
        foreach ($xpath->query('//img[@src]') as $img) {
            $img->setAttribute('src', SiteUrl::absolute($img->getAttribute('src')));
        }
        foreach ($xpath->query('//a[@href]') as $a) {
            $href = $a->getAttribute('href');
            if (Str::startsWith($href, '/')) {
                $a->setAttribute('href', SiteUrl::page($href));
            }
        }
        $root = $doc->getElementById('crosspost');
        $out = '';
        foreach ($root->childNodes as $child) {
            $out .= $doc->saveHTML($child);
        }

        return $out;
    }
}
