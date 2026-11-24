<?php

namespace Tests\Feature;

use App\Mail\ConsultationRequestAdminNotification;
use App\Mail\ConsultationRequestUserReceipt;
use App\Models\ConsultationRequest;
use App\Models\SiteSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/** The brief's budget and timeline, and the booking link in the reply. */
class BookingAndBriefTest extends TestCase
{
    use RefreshDatabase;

    private function brief(array $extra = []): array
    {
        return $extra + ['first_name' => 'Ada', 'last_name' => 'Lovelace', 'email' => 'ada@example.com', 'message' => 'A clinic platform.'];
    }

    private function setting(string $key, string $value, string $group = 'contact'): void
    {
        SiteSetting::updateOrCreate(['key' => $key], ['value' => $value, 'type' => 'text', 'group' => $group]);
    }

    public function test_a_brief_keeps_its_budget_and_timeline(): void
    {
        Mail::fake();

        $this->postJson('/api/consultation-requests', $this->brief(['budget' => '$15,000 – $40,000', 'timeline' => 'Within 3 months']))->assertSuccessful();

        $this->assertDatabaseHas('consultation_requests', ['email' => 'ada@example.com', 'budget' => '$15,000 – $40,000', 'timeline' => 'Within 3 months']);
    }

    public function test_budget_and_timeline_are_optional(): void
    {
        Mail::fake();

        $this->postJson('/api/consultation-requests', $this->brief())->assertSuccessful();
        $this->postJson('/api/consultation-requests', $this->brief(['budget' => str_repeat('x', 61)]))->assertStatus(422);
    }

    public function test_the_migration_adds_an_empty_booking_link_to_contact_details(): void
    {
        $this->assertSame('', SiteSetting::where('key', 'booking_url')->value('value') ?? '');
        $this->assertSame('contact', SiteSetting::where('key', 'booking_url')->value('group'));
    }

    public function test_the_reply_offers_the_booking_link_only_when_one_is_set(): void
    {
        $brief = ConsultationRequest::create($this->brief());

        $this->assertStringNotContainsString('Book a Call', (new ConsultationRequestUserReceipt($brief))->render());

        $this->setting('booking_url', 'https://cal.com/okjtech/intro');
        $this->assertStringContainsString('href="https://cal.com/okjtech/intro"', (new ConsultationRequestUserReceipt($brief))->render());
    }

    public function test_the_studio_copy_shows_budget_and_timeline(): void
    {
        $brief = ConsultationRequest::create($this->brief(['budget' => 'Over $40,000', 'timeline' => 'Just exploring']));

        $html = (new ConsultationRequestAdminNotification($brief))->render();

        $this->assertStringContainsString('Over $40,000', $html);
        $this->assertStringContainsString('Just exploring', $html);
    }

    public function test_the_book_page_is_a_page(): void
    {
        $index = public_path('index.html');
        $original = is_file($index) ? file_get_contents($index) : null;
        file_put_contents($index, '<!doctype html><html><head><!--okjt:seo--><title>x</title><!--/okjt:seo--></head><body><div id="root"></div></body></html>');
        try {
            $this->get('/book')->assertOk()->assertSee('<title>Book a call | OKJTech</title>', false)->assertSee('<h1>Book a call</h1>', false);
        } finally {
            $original === null ? @unlink($index) : file_put_contents($index, $original);
        }
    }
}
