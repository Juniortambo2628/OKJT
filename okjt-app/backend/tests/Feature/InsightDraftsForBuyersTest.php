<?php

namespace Tests\Feature;

use App\Models\Insight;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Growth plan item 5: four draft insights for people commissioning a platform in Kenya. */
class InsightDraftsForBuyersTest extends TestCase
{
    use RefreshDatabase;

    private const MIGRATION = '2026_11_23_000004_insight_drafts_for_buyers';

    /** Pages the drafts may link to. */
    private const PAGES = ['/tools/estimate', '/tools/launch-checklist', '/tools/site-check', '/contact', '/book', '/how-we-work'];

    private function migration(): object
    {
        return require database_path('migrations/'.self::MIGRATION.'.php');
    }

    public function test_the_drafts_are_added_unpublished_once(): void
    {
        User::factory()->create();
        $migration = $this->migration();
        $migration->up();
        $migration->up();

        $slugs = array_column($migration::drafts(), 'slug');
        $this->assertSame(4, Insight::whereIn('slug', $slugs)->count());
        $this->assertSame(0, Insight::whereIn('slug', $slugs)->where('is_published', true)->count());
        $this->assertSame([$migration::TOPIC], Insight::whereIn('slug', $slugs)->distinct()->pluck('category')->all());

        $public = collect($this->getJson('/api/insights')->assertOk()->json())->flatten(1)->pluck('slug')->filter()->all();
        $this->assertEmpty(array_intersect($slugs, $public), 'drafts stay off the site until published');
    }

    public function test_every_link_goes_to_a_real_page_and_the_voice_has_no_i(): void
    {
        $drafts = $this->migration()::drafts();
        $slugs = array_column($drafts, 'slug');

        foreach ($drafts as $draft) {
            preg_match_all('/href="([^"]+)"/', $draft['content'], $m);
            $this->assertNotEmpty($m[1], "{$draft['slug']} links somewhere");
            foreach ($m[1] as $href) {
                $ok = in_array($href, self::PAGES, true) || (str_starts_with($href, '/insights/') && in_array(substr($href, 10), $slugs, true));
                $this->assertTrue($ok, "{$draft['slug']} links to {$href}");
            }
            $text = strip_tags($draft['content']);
            $this->assertDoesNotMatchRegularExpression('/\bI\b|\bI’m\b|\bmy\b/u', $text, "{$draft['slug']} speaks as “I”");
            $this->assertStringContainsString('<h2>', $draft['content']);
            $this->assertLessThanOrEqual(240, mb_strlen($draft['excerpt']));
        }
    }
}
