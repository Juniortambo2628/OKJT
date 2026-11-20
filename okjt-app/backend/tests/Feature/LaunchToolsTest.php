<?php

namespace Tests\Feature;

use App\Mail\LaunchChecklistMail;
use App\Models\SiteSetting;
use App\Models\Subscriber;
use App\Support\LaunchChecklist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/** Item 4: the launch checklist and the cost estimator's pages and settings. */
class LaunchToolsTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_checklist_is_served_with_every_section(): void
    {
        $this->getJson('/api/tools/launch-checklist')
            ->assertOk()
            ->assertJsonCount(count(LaunchChecklist::sections()), 'data')
            ->assertJsonPath('data.0.id', 'data-protection')
            ->assertJsonPath('data.0.items.0.id', 'odpc-registration');
        $this->assertGreaterThanOrEqual(20, LaunchChecklist::count());
    }

    public function test_the_checklist_can_be_emailed_and_the_reader_subscribe(): void
    {
        Mail::fake();

        $this->postJson('/api/tools/launch-checklist/email', ['email' => 'Founder@Example.com', 'subscribe' => true])->assertOk();
        $this->postJson('/api/tools/launch-checklist/email', ['email' => 'other@example.com'])->assertOk();
        $this->postJson('/api/tools/launch-checklist/email', ['email' => 'not-an-email'])->assertStatus(422);

        Mail::assertSent(LaunchChecklistMail::class, 2);
        $this->assertSame('checklist', Subscriber::where('email', 'founder@example.com')->value('source'));
        $this->assertFalse(Subscriber::where('email', 'other@example.com')->exists());
        $this->assertStringContainsString('Register with the Data Protection Commissioner', (new LaunchChecklistMail)->render());
    }

    public function test_both_tools_are_pages_with_their_words_in_the_html(): void
    {
        $index = public_path('index.html');
        $original = is_file($index) ? file_get_contents($index) : null;
        file_put_contents($index, '<!doctype html><html><head><!--okjt:seo--><title>x</title><!--/okjt:seo--></head><body><div id="root"></div></body></html>');
        try {
            $this->get('/tools/launch-checklist')->assertOk()
                ->assertSee('<h1>Launch checklist for African markets</h1>', false)
                ->assertSee('<strong>Take M-Pesa through your own Paybill or Till.</strong>', false);
            $this->get('/tools/estimate')->assertOk()->assertSee('<h1>Project cost estimator</h1>', false);
            $this->get('/sitemap.xml')->assertSee('/tools/estimate</loc>', false)->assertSee('/tools/launch-checklist</loc>', false);
        } finally {
            $original === null ? @unlink($index) : file_put_contents($index, $original);
        }
    }

    public function test_the_estimator_prices_are_a_setting(): void
    {
        $this->assertSame('services', SiteSetting::where('key', 'estimator_config')->value('group'));
    }
}
