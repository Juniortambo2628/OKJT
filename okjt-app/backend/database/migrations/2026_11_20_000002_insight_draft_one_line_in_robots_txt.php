<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A draft insight (not published): how one line in robots.txt hid
 * okjtech.co.ke's pages from Google, and what fixed it. The numbers are
 * Search Console's coverage export of 19 November 2026. Publish it from the
 * dashboard once the after-numbers are in. Voice: documentation/VOICE_AND_TONE.md.
 */
return new class extends Migration
{
    public const SLUG = 'one-line-in-robots-txt';

    public function up(): void
    {
        if (! Schema::hasTable('insights') || DB::table('insights')->where('slug', self::SLUG)->exists()) {
            return;
        }
        $author = DB::table('insights')->whereNotNull('user_id')->value('user_id') ?? DB::table('users')->value('id');
        if (! $author) {
            return;
        }

        DB::table('insights')->insert([
            'title' => 'One line in robots.txt, and the pages Google couldn’t see',
            'slug' => self::SLUG,
            'category' => 'Engineering',
            'excerpt' => 'A sensible-looking rule told Google to stay out of the place every page gets its words from. Here is how it showed up in Search Console, what fixed it, and a free check so it doesn’t happen to your site.',
            'content' => trim(<<<'HTML'
<p>On 11 November, okjtech.co.ke gained a sitemap, one address per page and structured data: the things a site does to be found. It also gained a line in robots.txt that looked just as sensible: <code>Disallow: /api/</code>. Nobody wants raw data in search results.</p>
<p>Three days later, Search Console counted 80 pages in Google’s index, down from 91, and 122 left out, up from 68. The reasons it gave were the vague ones: “crawled, currently not indexed”, “discovered, currently not indexed”, “duplicate without user-selected canonical”.</p>
<h2>What Google was actually seeing</h2>
<p>The site is a React app. Each page arrives as a nearly empty shell and fills itself in by asking <code>/api/</code> for its words. Google renders pages the way a browser does, but it obeys robots.txt for every file it fetches, so it never got the words. Rendered the way Google had to render them, project, article and service pages all came out as the same empty template, with a blank heading. Dozens of identical, empty pages: no wonder it kept them out.</p>
<h2>What fixed it</h2>
<ul>
<li><strong>Let Google read the data.</strong> The <code>/api/</code> rule came out of robots.txt. The data is kept out of results with an <code>X-Robots-Tag: noindex</code> header instead, which lets Google read it without listing it.</li>
<li><strong>Send the words with the page.</strong> The server now writes each page’s heading, text and links into the HTML it sends, so a reader that runs no JavaScript at all still gets the page.</li>
<li><strong>One address per page.</strong> The home page answered on www. and on the API’s own address as well as the main one; those now redirect.</li>
</ul>
<p>None of these is clever. Each is a small, careful decision about who reads a page, and a crawler is one of those readers.</p>
<h2>Check your own site</h2>
<p>The checks used to find all this are now a free tool: the <a href="/tools/site-check">website health check</a>. Enter any page and it reports what Google meets first, robots.txt and the files it blocks, redirects, canonical addresses, how much of the page is there before JavaScript runs, link previews and speed, with a plain fix for each problem. If something on your site has gone quiet in Search Console, it is a good first place to look.</p>
HTML),
            'user_id' => $author,
            'is_published' => false,
            'published_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('insights')->where('slug', self::SLUG)->where('is_published', false)->delete();
    }
};
