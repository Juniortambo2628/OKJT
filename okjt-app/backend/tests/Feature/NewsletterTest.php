<?php

namespace Tests\Feature;

use App\Mail\NewsletterWelcome;
use App\Models\Subscriber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/** Item 5: the newsletter signup, and leaving it. */
class NewsletterTest extends TestCase
{
    use RefreshDatabase;

    public function test_signing_up_adds_the_address_and_sends_a_welcome(): void
    {
        Mail::fake();

        $this->postJson('/api/subscribe', ['email' => 'Reader@Example.com', 'source' => 'insights', 'consent' => true])
            ->assertOk()->assertJsonPath('message', 'Subscribed.');

        $subscriber = Subscriber::where('email', 'reader@example.com')->firstOrFail();
        $this->assertTrue($subscriber->is_active);
        $this->assertSame('insights', $subscriber->source);
        Mail::assertSent(NewsletterWelcome::class, fn ($mail) => $mail->hasTo('reader@example.com'));
    }

    public function test_signing_up_needs_consent_a_real_address_and_a_known_source(): void
    {
        $this->postJson('/api/subscribe', ['email' => 'reader@example.com'])->assertStatus(422)->assertJsonValidationErrors('consent');
        $this->postJson('/api/subscribe', ['email' => 'nope', 'consent' => true])->assertStatus(422)->assertJsonValidationErrors('email');
        $this->postJson('/api/subscribe', ['email' => 'reader@example.com', 'consent' => true, 'source' => 'admin'])->assertStatus(422)->assertJsonValidationErrors('source');
        $this->assertSame(0, Subscriber::count());
    }

    /** Laravel 11's email rule let a quoted address with a line break through (fixed in Laravel 12.60). */
    public function test_an_address_with_a_line_break_is_refused(): void
    {
        $this->postJson('/api/subscribe', ['email' => "\"a\r\nBcc: x@example.com\"@example.com", 'consent' => true])
            ->assertStatus(422)->assertJsonValidationErrors('email');
        $this->postJson('/api/consultation-requests', ['first_name' => 'A', 'last_name' => 'B', 'email' => "\"a\r\nBcc: x@example.com\"@example.com", 'message' => 'Hello there, a project.'])
            ->assertStatus(422)->assertJsonValidationErrors('email');
        $this->assertSame(0, Subscriber::count());
    }

    /** Before: a second signup answered "The email has already been taken", which told anyone who is on the list. */
    public function test_an_address_already_on_the_list_gets_the_same_answer_and_no_second_welcome(): void
    {
        Mail::fake();
        Subscriber::create(['email' => 'reader@example.com', 'source' => 'footer', 'is_active' => true]);

        $this->postJson('/api/subscribe', ['email' => 'reader@example.com', 'source' => 'insight', 'consent' => true])
            ->assertOk()->assertJsonPath('message', 'Subscribed.');

        $this->assertSame(1, Subscriber::count());
        $this->assertSame('footer', Subscriber::first()->source);
        Mail::assertNothingSent();
    }

    public function test_someone_who_left_or_was_removed_can_sign_up_again(): void
    {
        Mail::fake();
        Subscriber::create(['email' => 'left@example.com', 'is_active' => false]);
        Subscriber::create(['email' => 'removed@example.com', 'is_active' => true])->delete();

        $this->postJson('/api/subscribe', ['email' => 'left@example.com', 'consent' => true])->assertOk();
        $this->postJson('/api/subscribe', ['email' => 'removed@example.com', 'consent' => true])->assertOk();

        $this->assertTrue(Subscriber::where('email', 'left@example.com')->value('is_active'));
        $this->assertNotNull(Subscriber::where('email', 'removed@example.com')->first());
        Mail::assertSent(NewsletterWelcome::class, 2);
    }

    public function test_the_welcome_carries_a_signed_one_click_unsubscribe_link(): void
    {
        $subscriber = Subscriber::create(['email' => 'reader@example.com', 'is_active' => true]);
        $mail = new NewsletterWelcome($subscriber);
        $link = $mail->unsubscribeUrl();

        $this->assertStringContainsString('signature=', $link);
        $this->assertStringContainsString(e($link), $mail->render());
        $this->assertSame('<'.$link.'>', $mail->headers()->text['List-Unsubscribe']);

        $this->get($link)->assertRedirect(rtrim(config('app.frontend_url'), '/').'/insights?unsubscribed=1');
        $this->assertFalse($subscriber->fresh()->is_active);
    }

    public function test_a_mail_apps_one_click_unsubscribe_button_works(): void
    {
        $subscriber = Subscriber::create(['email' => 'reader@example.com', 'is_active' => true]);

        $this->post((new NewsletterWelcome($subscriber))->unsubscribeUrl(), ['List-Unsubscribe' => 'One-Click'])->assertOk();

        $this->assertFalse($subscriber->fresh()->is_active);
    }

    public function test_an_unsigned_or_altered_unsubscribe_link_does_nothing(): void
    {
        $subscriber = Subscriber::create(['email' => 'reader@example.com', 'is_active' => true]);
        $other = Subscriber::create(['email' => 'other@example.com', 'is_active' => true]);

        $this->get('/api/newsletter/unsubscribe/'.$subscriber->id)->assertForbidden();
        $tampered = str_replace('/'.$subscriber->id.'?', '/'.$other->id.'?', (new NewsletterWelcome($subscriber))->unsubscribeUrl());
        $this->get($tampered)->assertForbidden();

        $this->assertTrue($subscriber->fresh()->is_active);
        $this->assertTrue($other->fresh()->is_active);
    }

    /** Before: an unknown address answered 404 "Email not found.", which told anyone who is on the list. */
    public function test_unsubscribing_by_address_answers_the_same_either_way(): void
    {
        Subscriber::create(['email' => 'reader@example.com', 'is_active' => true]);

        $known = $this->postJson('/api/unsubscribe', ['email' => 'Reader@Example.com'])->assertOk()->json('message');
        $unknown = $this->postJson('/api/unsubscribe', ['email' => 'stranger@example.com'])->assertOk()->json('message');

        $this->assertSame($known, $unknown);
        $this->assertFalse(Subscriber::where('email', 'reader@example.com')->value('is_active'));
    }

    public function test_signups_are_rate_limited(): void
    {
        Mail::fake();
        foreach (range(1, 5) as $n) {
            $this->postJson('/api/subscribe', ['email' => "reader{$n}@example.com", 'consent' => true])->assertOk();
        }
        $this->postJson('/api/subscribe', ['email' => 'reader6@example.com', 'consent' => true])->assertStatus(429);
    }
}
