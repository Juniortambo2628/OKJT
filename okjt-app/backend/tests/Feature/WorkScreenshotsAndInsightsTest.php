<?php

namespace Tests\Feature;

use App\Models\Insight;
use App\Models\Project;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The 2026-11-11 content migrations: project screenshots join the galleries
 * without displacing uploads, empty images are filled and set ones kept, and
 * the articles are rewritten or added in place.
 */
class WorkScreenshotsAndInsightsTest extends TestCase
{
    use RefreshDatabase;

    private function runMigration(string $name): void
    {
        (require database_path("migrations/{$name}.php"))->up();
    }

    private function project(string $slug, ?array $gallery): Project
    {
        // Earlier migrations may already hold these projects.
        return Project::updateOrCreate(['slug' => $slug], ['type' => 'client', 'title' => ucfirst($slug), 'gallery' => $gallery, 'is_active' => true]);
    }

    public function test_screenshots_fill_galleries_and_keep_uploads(): void
    {
        $empty = $this->project('najenga', [null]);
        $uploaded = $this->project('ai-policy-lab', ['/storage/uploads/mine.webp']);
        $untouched = $this->project('good-kenyan-foundation', ['/storage/uploads/a.webp']);

        $this->runMigration('2026_11_11_000001_add_work_screenshots');

        $this->assertSame(
            array_map(fn ($n) => "/assets/images/work/najenga/0{$n}.webp", [1, 2, 3, 4, 5]),
            $empty->fresh()->gallery,
        );
        $gallery = $uploaded->fresh()->gallery;
        $this->assertSame('/storage/uploads/mine.webp', $gallery[0]);
        $this->assertCount(6, $gallery);
        $this->assertSame(['/storage/uploads/a.webp'], $untouched->fresh()->gallery);

        // Running again adds nothing twice.
        $this->runMigration('2026_11_11_000001_add_work_screenshots');
        $this->assertCount(6, $uploaded->fresh()->gallery);
    }

    public function test_every_shipped_screenshot_exists(): void
    {
        foreach (glob(database_path('migrations/2026_11_11_00000*.php')) as $file) {
            preg_match_all("#'([a-z0-9-]+/\\d{2})'#", file_get_contents($file), $shots);
            foreach ($shots[1] as $shot) {
                $this->assertFileExists(base_path("../web/public/assets/images/work/{$shot}.webp"), $shot);
            }
            preg_match_all("#'(/assets/images/[a-z0-9/-]+\\.webp)'#", file_get_contents($file), $paths);
            foreach ($paths[1] as $path) {
                $this->assertFileExists(base_path("../web/public{$path}"), $path);
            }
        }
    }

    public function test_only_empty_service_images_are_filled(): void
    {
        $blank = Service::updateOrCreate(['slug' => 'custom-web-applications'], ['title' => 'Custom', 'category' => 'Web', 'image' => null, 'is_active' => true]);
        $set = Service::updateOrCreate(['slug' => 'ecommerce-platforms'], ['title' => 'Shops', 'category' => 'Web', 'image' => '/storage/uploads/shop.webp', 'is_active' => true]);

        $this->runMigration('2026_11_11_000001_add_work_screenshots');

        $this->assertSame('/assets/images/work/najenga/01.webp', $blank->fresh()->image);
        $this->assertSame('/storage/uploads/shop.webp', $set->fresh()->image);
    }

    public function test_articles_are_rewritten_in_place_and_new_ones_added(): void
    {
        $user = User::factory()->create();
        Insight::query()->forceDelete();
        $old = Insight::create([
            'title' => 'Old', 'slug' => 'ecosystem-mapping-before-you-write-a-line-of-code', 'category' => 'Strategy',
            'content' => '<p>Old</p>', 'user_id' => $user->id, 'is_published' => true, 'published_at' => '2026-09-15 00:00:00',
        ]);

        $this->runMigration('2026_11_11_000002_insights_in_kevins_voice');

        $old->refresh();
        $this->assertStringContainsString('<h2>', $old->content);
        $this->assertSame('2026-09-15', $old->published_at->toDateString());
        $this->assertSame(14, Insight::count());
        $this->assertTrue(Insight::where('slug', 'there-is-no-impossible-problem')->first()->is_published);
        $this->getJson('/api/insights')->assertOk()->assertJsonPath('0.slug', 'there-is-no-impossible-problem');

        $this->runMigration('2026_11_11_000003_flagship_stories_and_lawyers_hub_work');
        $this->assertSame(20, Insight::count());
        $this->assertStringContainsString('Kakamega', Insight::where('slug', 'tibu-the-same-care-in-nairobi-and-kakamega')->value('content'));

        $this->runMigration('2026_11_11_000005_lawyers_hub_survey_findings');
        $this->assertSame(23, Insight::count());

        // Written about the work: no first person outside quotations.
        foreach (Insight::all() as $insight) {
            $text = strip_tags(preg_replace('/"[^"]*"|<em>[^<]*<\/em>/', '', $insight->title.' '.$insight->excerpt.' '.$insight->content));
            $this->assertDoesNotMatchRegularExpression("/\\b(I|I'm|I've|I'll|my|me)\\b/", $text, $insight->slug);
        }
    }

    public function test_case_studies_speak_about_the_work_and_nyalife_loses_its_link(): void
    {
        $hms = Project::updateOrCreate(['slug' => 'nyalife-hms'], ['type' => 'client', 'title' => 'Nyalife HMS', 'url' => 'https://nyalifewomensclinic.net', 'is_active' => true]);
        $tibu = Project::updateOrCreate(['slug' => 'tibu'], ['type' => 'flagship', 'title' => 'Tibu', 'description' => 'the Nyalife HMS is its first live instance', 'is_active' => true]);

        $this->runMigration('2026_11_11_000004_case_studies_about_the_work');

        $this->assertNull($hms->fresh()->url);
        $this->assertStringNotContainsString('first live instance', $tibu->fresh()->description);
        $this->assertStringContainsString('Kakamega', $tibu->fresh()->problem);
        foreach (Project::all() as $project) {
            foreach (['description', 'problem', 'methodology', 'outcome'] as $field) {
                $this->assertDoesNotMatchRegularExpression('/\\bI (built|designed|chaired|helped)\\b/', (string) $project->{$field}, "{$project->slug}.{$field}");
            }
        }
    }
}
