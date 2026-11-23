<?php

namespace Tests\Feature;

use App\Mail\ConsultationRequestAdminNotification;
use App\Mail\ConsultationRequestUserReceipt;
use App\Mail\CustomPasswordResetMail;
use App\Mail\LaunchChecklistMail;
use App\Mail\NewsletterWelcome;
use App\Mail\RsvpConfirmation;
use App\Models\ConsultationRequest;
use App\Models\Rsvp;
use App\Models\SiteSetting;
use App\Models\Subscriber;
use App\Support\EnquiryReply;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Mail\Mailable;
use Tests\TestCase;

/** Every email the site sends: OKJTechnologies' own frame and words, nothing left from the borrowed template. */
class EmailTemplatesTest extends TestCase
{
    use RefreshDatabase;

    /** Words from the template the emails were first copied from. */
    private const BORROWED = ['Canary Wharf', 'London', 'advisory team', '24-48', 'market intelligence', 'All rights reserved', 'Security Alert', '#3b82f6', 'CMS'];

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.frontend_url' => 'https://okjtech.co.ke']);
        SiteSetting::updateOrCreate(['key' => 'contact_email'], ['value' => 'hello@okjtech.co.ke', 'type' => 'text', 'group' => 'contact']);
        SiteSetting::updateOrCreate(['key' => 'contact_phone'], ['value' => '+254 705 883227', 'type' => 'text', 'group' => 'contact']);
    }

    private function brief(array $extra = []): ConsultationRequest
    {
        return ConsultationRequest::create($extra + ['first_name' => 'Ada', 'last_name' => 'Lovelace', 'email' => 'ada@example.com', 'subject' => 'Clinic platform', 'message' => 'A clinic platform.']);
    }

    /** @return array<string, Mailable> */
    private function mails(): array
    {
        return [
            'reply' => new ConsultationRequestUserReceipt($this->brief()),
            'notification' => new ConsultationRequestAdminNotification($this->brief()),
            'password reset' => new CustomPasswordResetMail('https://okjtech.co.ke/admin/password-reset?token=x', 60),
            'rsvp' => new RsvpConfirmation(Rsvp::create(['name' => 'Ada', 'email' => 'ada@example.com', 'type' => 'rsvp', 'attendance' => 'accepted'])),
            'checklist' => new LaunchChecklistMail,
            'newsletter' => new NewsletterWelcome(Subscriber::create(['email' => 'ada@example.com', 'is_active' => true])),
        ];
    }

    public function test_every_email_has_the_studios_frame_and_none_of_the_borrowed_words(): void
    {
        foreach ($this->mails() as $name => $mail) {
            $html = $mail->render();
            $this->assertStringContainsString('https://okjtech.co.ke/logos/OKJT-Logos/OKJTechLogo-White_Transparent.png', $html, $name);
            $this->assertStringContainsString('OKJTechnologies</strong> &middot; Product engineering for African markets &middot; Nairobi, Kenya', $html, $name);
            $this->assertStringContainsString('mailto:hello@okjtech.co.ke', $html, $name);
            $this->assertStringContainsString('tel:+254705883227', $html, $name);
            $this->assertStringContainsString('#faf5e8', $html, $name);
            foreach (self::BORROWED as $words) {
                $this->assertStringNotContainsString($words, $html, "{$name} still says “{$words}”");
            }
        }
    }

    public function test_the_reply_uses_the_dashboards_subject_and_message_with_the_briefs_details(): void
    {
        $mail = new ConsultationRequestUserReceipt($this->brief());
        $this->assertSame(EnquiryReply::DEFAULT_SUBJECT, $mail->envelope()->subject);
        $this->assertStringContainsString('Thanks for your brief about <strong>Clinic platform</strong>', $mail->render());

        SiteSetting::updateOrCreate(['key' => 'enquiry_reply_subject'], ['value' => 'About {subject}, {first name}', 'type' => 'text', 'group' => 'email']);
        SiteSetting::updateOrCreate(['key' => 'enquiry_reply_message'], ['value' => '<p>Dear {First Name}, {subject} sounds good.</p>', 'type' => 'rich', 'group' => 'email']);
        $mail = new ConsultationRequestUserReceipt($this->brief());

        $this->assertSame('About Clinic platform, Ada', $mail->envelope()->subject);
        $this->assertStringContainsString('<p>Dear Ada, Clinic platform sounds good.</p>', $mail->render());
    }

    /** Before: the templates went through Blade::render, so anything typed in Settings ran on the server. */
    public function test_nothing_typed_in_the_settings_runs_as_code_and_details_are_escaped(): void
    {
        SiteSetting::updateOrCreate(['key' => 'enquiry_reply_message'], ['value' => '<p>{{ 6 * 7 }} @php echo "ran"; @endphp {subject}</p>', 'type' => 'rich', 'group' => 'email']);

        $html = (new ConsultationRequestUserReceipt($this->brief(['subject' => '<script>x</script>'])))->render();

        $this->assertStringContainsString('{{ 6 * 7 }} @php echo "ran"; @endphp &lt;script&gt;x&lt;/script&gt;', $html);
        $this->assertStringNotContainsString('42', $html);
        $this->assertStringNotContainsString('<script>x</script>', $html);
    }

    public function test_the_notification_replies_to_the_visitor_and_links_to_enquiries(): void
    {
        $mail = new ConsultationRequestAdminNotification($this->brief(['budget' => '$7,500 – $10,000']));

        $this->assertSame('New brief from Ada Lovelace: Clinic platform', $mail->envelope()->subject);
        $this->assertSame('ada@example.com', $mail->envelope()->replyTo[0]->address);
        $html = $mail->render();
        $this->assertStringContainsString('https://okjtech.co.ke/admin/requests', $html);
        $this->assertStringContainsString('$7,500 – $10,000', $html);
    }

    public function test_the_migration_swaps_the_code_templates_for_plain_words(): void
    {
        $this->assertFalse(SiteSetting::whereIn('key', ['email_template_admin', 'email_template_user'])->exists());
        $this->assertSame(EnquiryReply::DEFAULT_SUBJECT, SiteSetting::where('key', 'enquiry_reply_subject')->value('value'));
        $this->assertSame('email', SiteSetting::where('key', 'enquiry_reply_message')->value('group'));
    }
}
