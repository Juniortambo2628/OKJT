<?php

namespace App\Http\Controllers;

use App\Models\Insight;
use App\Support\CrossPost;
use App\Support\SiteUrl;

/**
 * /feed.xml: the published insights as RSS, each in full with its
 * okjtech.co.ke address. DEV (dev.to) can import posts from it as drafts
 * with that address as their canonical, and feed readers can follow it.
 */
class FeedController extends Controller
{
    private const LIMIT = 20;

    public function __invoke()
    {
        $insights = Insight::where('is_published', true)
            ->orderByDesc('published_at')->orderByDesc('created_at')
            ->limit(self::LIMIT)->get();
        $e = fn ($value) => htmlspecialchars((string) $value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
        $cdata = fn ($value) => '<![CDATA['.str_replace(']]>', ']]]]><![CDATA[>', (string) $value).']]>';

        $items = $insights->map(function (Insight $insight) use ($e, $cdata) {
            $post = new CrossPost($insight);

            return implode("\n", array_filter([
                '    <item>',
                '      <title>'.$e($insight->title).'</title>',
                '      <link>'.$e($post->url()).'</link>',
                '      <guid isPermaLink="true">'.$e($post->url()).'</guid>',
                '      <pubDate>'.($insight->published_at ?: $insight->created_at)->toRfc2822String().'</pubDate>',
                $insight->category ? '      <category>'.$e($insight->category).'</category>' : null,
                '      <description>'.$e(trim(preg_replace('/\s+/', ' ', strip_tags((string) ($insight->excerpt ?: $insight->content))))).'</description>',
                '      <content:encoded>'.$cdata($post->html()).'</content:encoded>',
                '    </item>',
            ]));
        })->implode("\n");

        $xml = implode("\n", [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">',
            '  <channel>',
            '    <title>OKJTech Insights</title>',
            '    <link>'.$e(SiteUrl::page('/insights')).'</link>',
            '    <atom:link href="'.$e(SiteUrl::page('/feed.xml')).'" rel="self" type="application/rss+xml" />',
            '    <description>Notes on building web platforms for African markets, from OKJTechnologies in Nairobi.</description>',
            '    <language>en</language>',
            $insights->first() ? '    <lastBuildDate>'.$insights->max('updated_at')->toRfc2822String().'</lastBuildDate>' : '',
            $items,
            '  </channel>',
            '</rss>',
        ]);

        return response($xml, 200)
            ->header('Content-Type', 'application/rss+xml; charset=UTF-8')
            ->header('Cache-Control', 'public, max-age=900');
    }
}
