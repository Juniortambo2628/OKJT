<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Okjt\Kit\Content\ContactMessage;
use Okjt\Kit\Content\ContactMessageReceived;
use Okjt\Kit\Content\ContactReply;
use Okjt\Kit\Content\SiteSettings;
use Okjt\Kit\Http\Controllers\ContactMessageController;
use Okjt\Kit\Http\Middleware\EnsureSuperadmin;
use Okjt\Kit\Tests\TestCase;

/** The contact form and its inbox (S6, step 5), from Naoa and Tena-host. */
class ContactMessagesTest extends TestCase
{
    protected function defineRoutes($router): void
    {
        $router->post('/api/contact', [ContactMessageController::class, 'store'])->middleware('throttle:5,5');
        $router->middleware(EnsureSuperadmin::class)->group(function () use ($router) {
            $router->get('/api/admin/contact-messages', [ContactMessageController::class, 'index']);
            $router->get('/api/admin/contact-messages/{id}', [ContactMessageController::class, 'show']);
            $router->post('/api/admin/contact-messages/{id}/reply', [ContactMessageController::class, 'reply']);
            $router->patch('/api/admin/contact-messages/{id}', [ContactMessageController::class, 'update']);
            $router->delete('/api/admin/contact-messages/{id}', [ContactMessageController::class, 'destroy']);
        });
    }

    private function admin()
    {
        $user = $this->person('admin@example.com');
        $user->forceFill(['is_superadmin' => true])->save();

        return $user;
    }

    private function send(array $extra = [])
    {
        return $this->postJson('/api/contact', $extra + ['name' => 'Amina', 'email' => 'amina@example.com', 'subject' => 'Group booking', 'message' => 'Can 12 of us come?']);
    }

    public function test_a_message_is_kept_and_the_team_is_told_with_the_sender_as_reply_to(): void
    {
        Notification::fake();
        config()->set('okjt.contact.notify_email', 'team@example.com');

        $this->send()->assertCreated()->assertJsonPath('message', "Thanks, we'll get back to you shortly.");

        $this->assertSame('new', ContactMessage::sole()->status);
        Notification::assertSentTo(new AnonymousNotifiable, ContactMessageReceived::class, function ($n, $channels, $notifiable) {
            $mail = $n->toMail($notifiable);

            return $notifiable->routes['mail'] === 'team@example.com' && $mail->replyTo[0][0] === 'amina@example.com';
        });
    }

    public function test_without_a_set_address_the_contact_email_setting_is_used_and_with_neither_nobody_is_emailed(): void
    {
        Notification::fake();
        $this->send();
        Notification::assertNothingSent();

        SiteSettings::put(['contact_email' => ['value' => 'hello@example.com', 'group' => 'contact']]);
        $this->send(['email' => 'b@example.com']);
        Notification::assertSentTo(new AnonymousNotifiable, ContactMessageReceived::class, fn ($n, $c, $notifiable) => $notifiable->routes['mail'] === 'hello@example.com');
    }

    public function test_a_failed_email_never_loses_the_message(): void
    {
        config()->set('okjt.contact.notify_email', 'team@example.com');
        config()->set('mail.default', 'broken');
        config()->set('mail.mailers.broken', ['transport' => 'smtp', 'host' => '127.0.0.1', 'port' => 1, 'timeout' => 1]);

        $this->send()->assertCreated();
        $this->assertSame(1, ContactMessage::count());
    }

    public function test_a_bot_filling_the_hidden_field_gets_the_same_answer_and_nothing_is_kept(): void
    {
        Notification::fake();
        $this->send(['website' => 'http://spam.example'])->assertCreated();
        $this->assertSame(0, ContactMessage::count());
        Notification::assertNothingSent();
    }

    public function test_bad_input_and_too_many_sends_are_refused(): void
    {
        $this->postJson('/api/contact', ['name' => 'A', 'email' => 'not-an-email', 'message' => 'x'])->assertUnprocessable()->assertJsonValidationErrors('email');
        config()->set('okjt.contact.topics', ['bookings', 'press']);
        $this->send(['topic' => 'other'])->assertUnprocessable()->assertJsonValidationErrors('topic');

        for ($i = 0; $i < 3; $i++) {
            $this->send();
        }
        $this->send()->assertStatus(429);
    }

    public function test_the_inbox_filters_searches_counts_and_marks_a_message_read_when_opened(): void
    {
        ContactMessage::create(['name' => 'Amina', 'email' => 'amina@example.com', 'message' => 'Hi', 'status' => 'new']);
        $b = ContactMessage::create(['name' => 'Brian', 'email' => 'brian@example.com', 'subject' => 'Press', 'message' => 'Hello', 'status' => 'new']);
        $this->actingAs($this->admin());

        $this->getJson('/api/admin/contact-messages?status=new')->assertOk()
            ->assertJsonPath('data.meta.total', 2)
            ->assertJsonPath('data.counts.new', 2);
        $this->getJson('/api/admin/contact-messages?search=press')->assertJsonPath('data.meta.total', 1)->assertJsonPath('data.data.0.name', 'Brian');

        $this->getJson("/api/admin/contact-messages/{$b->id}")->assertOk()->assertJsonPath('data.status', 'read');
        $this->patchJson("/api/admin/contact-messages/{$b->id}", ['status' => 'archived'])->assertOk()->assertJsonPath('message', 'Archived');
        $this->patchJson("/api/admin/contact-messages/{$b->id}", ['status' => 'gone'])->assertUnprocessable();
    }

    public function test_a_reply_is_emailed_and_marked_replied_only_when_it_went(): void
    {
        $contact = ContactMessage::create(['name' => 'Amina', 'email' => 'amina@example.com', 'subject' => 'Group booking', 'message' => 'Hi', 'status' => 'read']);
        $this->actingAs($this->admin());

        config()->set('mail.default', 'broken');
        config()->set('mail.mailers.broken', ['transport' => 'smtp', 'host' => '127.0.0.1', 'port' => 1, 'timeout' => 1]);
        $this->postJson("/api/admin/contact-messages/{$contact->id}/reply", ['message' => 'Yes, all 12.'])->assertStatus(502);
        $this->assertSame('read', $contact->fresh()->status);

        Notification::fake();
        $this->postJson("/api/admin/contact-messages/{$contact->id}/reply", ['message' => 'Yes, all 12.'])->assertOk()
            ->assertJsonPath('data.status', 'replied')->assertJsonPath('data.reply_message', 'Yes, all 12.');
        Notification::assertSentTo(new AnonymousNotifiable, ContactReply::class, fn ($n, $c, $notifiable) => $notifiable->routes['mail'] === 'amina@example.com'
            && $n->toMail($notifiable)->subject === 'Re: Group booking');
    }

    public function test_old_messages_are_pruned_only_when_a_keep_period_is_set(): void
    {
        $old = ContactMessage::create(['name' => 'Old', 'email' => 'o@example.com', 'message' => 'x']);
        $old->forceFill(['created_at' => now()->subDays(400)])->save();
        ContactMessage::create(['name' => 'New', 'email' => 'n@example.com', 'message' => 'y']);

        $this->artisan('model:prune', ['--model' => [ContactMessage::class]]);
        $this->assertSame(2, ContactMessage::count());

        config()->set('okjt.contact.keep_days', 365);
        $this->artisan('model:prune', ['--model' => [ContactMessage::class]]);
        $this->assertSame(['New'], ContactMessage::pluck('name')->all());
    }

    public function test_others_cannot_read_the_inbox(): void
    {
        $this->actingAs($this->person('owner@example.com'));
        $this->getJson('/api/admin/contact-messages')->assertForbidden();
    }
}
