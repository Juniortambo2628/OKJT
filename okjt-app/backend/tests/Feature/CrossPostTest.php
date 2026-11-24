<?php

namespace Tests\Feature;

use App\Models\Insight;
use App\Models\User;
use App\Support\CrossPost;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/** Item 5: insights posted elsewhere keep okjtech.co.ke as their original. */
class CrossPostTest extends TestCase
{
    use RefreshDatabase;

    private function insight(array $overrides = []): Insight
    {
        return Insight::create($overrides + [
            'title' => 'M-Pesa "callbacks" that never arrive',
            'slug' => 'mpesa-callbacks',
            'category' => 'Payments & M-Pesa',
            'excerpt' => 'Why a paid order can stay unpaid, and how to recover it.',
            'content' => '<h2>The problem</h2><p>See the <a href="/tools/launch-checklist">checklist</a>.</p><p><img src="insights/flow.png" alt="Flow"></p><ul><li>Query the status</li></ul>',
            'image' => 'insights/cover.png',
            'is_published' => true,
            'published_at' => now()->subDay(),
            'user_id' => User::factory()->create()->id,
        ]);
    }

    public function test_the_dev_copy_sets_the_canonical_and_full_addresses(): void
    {
        $post = new CrossPost($this->insight());
        $url = rtrim(config('app.frontend_url'), '/').'/insights/mpesa-callbacks';
        $devto = $post->devto();

        $this->assertStringStartsWith("---\ntitle: \"M-Pesa \\\"callbacks\\\" that never arrive\"\npublished: false\n", $devto);
        $this->assertStringContainsString("canonical_url: {$url}\n", $devto);
        $this->assertStringContainsString('tags: paymentsmpesa', $devto);
        $this->assertStringContainsString('cover_image: '.rtrim(config('app.frontend_url'), '/').'/storage/insights/cover.png', $devto);
        $this->assertStringContainsString('## The problem', $devto);
        $this->assertStringContainsString('[checklist]('.rtrim(config('app.frontend_url'), '/').'/tools/launch-checklist)', $devto);
        $this->assertStringContainsString('![Flow]('.rtrim(config('app.frontend_url'), '/').'/storage/insights/flow.png)', $devto);
        $this->assertStringContainsString("*First published on [okjtech.co.ke]({$url}).*", $devto);
    }

    public function test_hashnode_and_linkedin_copies_credit_the_original(): void
    {
        $post = new CrossPost($this->insight());

        $this->assertStringStartsWith("# M-Pesa \"callbacks\" that never arrive\n\n## The problem", $post->hashnode());
        $this->assertStringContainsString('First published on', $post->hashnode());
        $this->assertSame(
            "M-Pesa \"callbacks\" that never arrive\n\nWhy a paid order can stay unpaid, and how to recover it.\n\nRead the full article: ".$post->url(),
            $post->linkedin(),
        );
    }

    public function test_only_admins_get_the_cross_post_copies(): void
    {
        $insight = $this->insight();

        $this->getJson("/api/insights/{$insight->id}/crosspost")->assertUnauthorized();
        Sanctum::actingAs(User::factory()->create(['is_admin' => false]));
        $this->getJson("/api/insights/{$insight->id}/crosspost")->assertForbidden();

        Sanctum::actingAs(User::factory()->create(['is_admin' => true]));
        $this->getJson("/api/insights/{$insight->id}/crosspost")
            ->assertOk()
            ->assertJsonPath('data.url', (new CrossPost($insight))->url())
            ->assertJsonPath('data.published', true)
            ->assertJsonStructure(['data' => ['devto', 'hashnode', 'linkedin']]);
    }

    public function test_the_feed_lists_published_insights_in_full(): void
    {
        $this->insight();
        $this->insight(['title' => 'A draft', 'slug' => 'a-draft', 'is_published' => false]);

        $response = $this->get('/feed.xml')->assertOk()->assertHeader('Content-Type', 'application/rss+xml; charset=UTF-8');
        $xml = simplexml_load_string($response->getContent());

        $this->assertNotFalse($xml);
        $this->assertCount(1, $xml->channel->item);
        $item = $xml->channel->item[0];
        $this->assertSame('M-Pesa "callbacks" that never arrive', (string) $item->title);
        $this->assertSame(rtrim(config('app.frontend_url'), '/').'/insights/mpesa-callbacks', (string) $item->link);
        $content = (string) $item->children('http://purl.org/rss/1.0/modules/content/')->encoded;
        $this->assertStringContainsString('<h2>The problem</h2>', $content);
        $this->assertStringContainsString('First published on', $content);
    }
}
