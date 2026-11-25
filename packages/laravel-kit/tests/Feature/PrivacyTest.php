<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Okjt\Kit\Console\AuditLog;
use Okjt\Kit\Content\ContactMessage;
use Okjt\Kit\Http\Controllers\PrivacyController;
use Okjt\Kit\Http\Middleware\EnsureSuperadmin;
use Okjt\Kit\Privacy\Eraser;
use Okjt\Kit\Privacy\ErasureRequest;
use Okjt\Kit\Privacy\ErasureRequested;
use Okjt\Kit\Tests\Fixtures\Project;
use Okjt\Kit\Tests\TestCase;
use Okjt\Kit\Workspace\CurrentWorkspace;

/** Requests to delete data and the retention schedule (S7), from Naoa. */
class PrivacyTest extends TestCase
{
    protected function defineRoutes($router): void
    {
        $router->post('/api/erasure-requests', [PrivacyController::class, 'request']);
        $router->middleware(EnsureSuperadmin::class)->group(function () use ($router) {
            $router->get('/api/admin/privacy', [PrivacyController::class, 'index']);
            $router->post('/api/admin/privacy/erasure-requests', [PrivacyController::class, 'store']);
            $router->post('/api/admin/privacy/erasure-requests/{id}/complete', [PrivacyController::class, 'complete']);
        });
    }

    private function admin()
    {
        $user = $this->person('admin@example.com');
        $user->forceFill(['is_superadmin' => true])->save();

        return $user;
    }

    private function ask(array $extra = [])
    {
        return $this->postJson('/api/erasure-requests', $extra + ['name' => 'Amina', 'email' => 'amina@example.com']);
    }

    private function message(string $email, ?string $at = null): ContactMessage
    {
        $message = ContactMessage::create(['name' => 'X', 'email' => $email, 'message' => 'Hello', 'status' => 'new']);
        if ($at) {
            $message->forceFill(['created_at' => $at])->save();
        }

        return $message;
    }

    public function test_a_request_gets_a_due_date_and_the_team_is_told(): void
    {
        Notification::fake();
        config()->set('okjt.privacy.notify_email', 'privacy@example.com');
        $this->travelTo('2026-11-01 10:00');

        $this->ask(['details' => 'I came to the open day.'])->assertCreated()
            ->assertJsonPath('data.due_at', '2026-11-15')
            ->assertJsonPath('message', "We've received your request and will deal with it within 14 days.");

        $request = ErasureRequest::sole();
        $this->assertSame('received', $request->status);
        Notification::assertSentTo(new AnonymousNotifiable, ErasureRequested::class, fn ($n, $c, $notifiable) => $notifiable->routes['mail'] === 'privacy@example.com');
    }

    public function test_a_request_needs_a_name_and_an_email_or_phone(): void
    {
        $this->postJson('/api/erasure-requests', ['name' => 'Amina'])->assertUnprocessable()->assertJsonValidationErrors(['email', 'phone']);
        $this->ask(['email' => null, 'phone' => '0700 000 001'])->assertCreated();
    }

    public function test_a_bot_filling_the_hidden_field_gets_the_same_answer_and_nothing_is_kept(): void
    {
        $this->ask(['website' => 'http://spam.example'])->assertCreated();
        $this->assertSame(0, ErasureRequest::count());
    }

    public function test_only_admins_see_and_handle_requests(): void
    {
        $this->actingAs($this->person('someone@example.com'))->getJson('/api/admin/privacy')->assertForbidden();
    }

    public function test_the_admin_sees_the_schedule_and_open_requests_first(): void
    {
        config()->set('okjt.contact.keep_days', 365);
        $this->message('old@example.com', now()->subDays(400)->toDateTimeString());
        $this->message('new@example.com');
        ErasureRequest::create(['name' => 'Done', 'email' => 'd@example.com', 'status' => 'done']);
        ErasureRequest::create(['name' => 'Open', 'email' => 'o@example.com']);

        $this->actingAs($this->admin())->getJson('/api/admin/privacy')->assertOk()
            ->assertJsonPath('data.retention.0', ['label' => 'Contact messages', 'period' => '365 days after they were sent', 'due' => 1])
            ->assertJsonPath('data.erasure_days', 14)
            ->assertJsonPath('data.requests.0.name', 'Open')
            ->assertJsonPath('data.requests.1.name', 'Done');
    }

    public function test_erasing_runs_the_kits_and_the_projects_erasers_and_is_audited(): void
    {
        $this->app->instance(SpyEraser::class, $spy = new SpyEraser);
        config()->set('okjt.privacy.erasers', [\Okjt\Kit\Privacy\ContactMessageEraser::class, SpyEraser::class]);
        $this->message('amina@example.com');
        $this->message('amina@example.com');
        $kept = $this->message('brian@example.com');
        $request = ErasureRequest::create(['name' => 'Amina', 'email' => 'amina@example.com']);

        $this->actingAs($admin = $this->admin())
            ->postJson("/api/admin/privacy/erasure-requests/{$request->id}/complete", ['action' => 'erase', 'subject_id' => 'guest-7'])
            ->assertOk()->assertJsonPath('data.status', 'done')
            ->assertJsonPath('data.outcome', '2 contact messages deleted; guest record anonymised.');

        $this->assertSame([$kept->id], ContactMessage::pluck('id')->all());
        $this->assertSame('guest-7', $spy->seen?->subject_id);
        $this->assertSame($admin->id, $request->fresh()->handled_by);
        $audit = AuditLog::sole();
        $this->assertSame(['privacy.erased', '#'.$request->id], [$audit->action, $audit->subject_label]);
        $this->assertStringNotContainsString('amina', json_encode($audit->toArray()));
    }

    public function test_an_eraser_that_fails_erases_nothing_and_leaves_the_request_open(): void
    {
        config()->set('okjt.privacy.erasers', [\Okjt\Kit\Privacy\ContactMessageEraser::class, FailingEraser::class]);
        $this->message('amina@example.com');
        $request = ErasureRequest::create(['name' => 'Amina', 'email' => 'amina@example.com']);

        $this->withoutExceptionHandling();
        try {
            $this->actingAs($this->admin())->postJson("/api/admin/privacy/erasure-requests/{$request->id}/complete", ['action' => 'erase']);
            $this->fail('Expected the eraser to throw');
        } catch (\RuntimeException) {
        }

        $this->assertSame(1, ContactMessage::count());
        $this->assertSame('received', $request->fresh()->status);
    }

    public function test_declining_needs_a_reason_and_a_dealt_with_request_cant_be_handled_again(): void
    {
        $request = ErasureRequest::create(['name' => 'Amina', 'email' => 'amina@example.com']);
        $this->actingAs($this->admin());
        $url = "/api/admin/privacy/erasure-requests/{$request->id}/complete";

        $this->postJson($url, ['action' => 'decline'])->assertUnprocessable()->assertJsonValidationErrors('outcome');
        $this->postJson($url, ['action' => 'decline', 'outcome' => 'We must keep invoices for 6 years.'])->assertOk()->assertJsonPath('data.status', 'declined');
        $this->postJson($url, ['action' => 'erase'])->assertStatus(422);
        $this->assertSame('privacy.declined', AuditLog::sole()->action);
    }

    public function test_the_team_can_record_a_request_that_came_another_way(): void
    {
        $this->actingAs($this->admin())->postJson('/api/admin/privacy/erasure-requests', ['name' => 'Brian', 'phone' => '0700 000 002'])
            ->assertCreated()->assertJsonPath('data.status', 'received');
    }

    public function test_the_daily_run_purges_old_data_and_lists_overdue_requests_without_erasing_them(): void
    {
        config()->set('okjt.contact.keep_days', 30);
        $this->message('old@example.com', now()->subDays(31)->toDateTimeString());
        $this->message('new@example.com');
        $this->message('amina@example.com');
        $request = ErasureRequest::create(['name' => 'Amina', 'email' => 'amina@example.com', 'due_at' => now()->subDay()]);

        $this->artisan('okjt:retention', ['--dry-run' => true])->expectsOutput('Would delete 1: Contact messages')->assertSuccessful();
        $this->assertSame(3, ContactMessage::count());

        $this->artisan('okjt:retention')->expectsOutput('Deleted 1: Contact messages')
            ->expectsOutputToContain("Overdue, needs a person: request #{$request->id}")->assertSuccessful();
        $this->assertSame(2, ContactMessage::count());
        $this->assertSame('received', $request->fresh()->status);
    }

    public function test_with_auto_complete_the_daily_run_erases_overdue_requests(): void
    {
        config()->set('okjt.privacy.auto_complete', true);
        $this->message('amina@example.com');
        $request = ErasureRequest::create(['name' => 'Amina', 'email' => 'amina@example.com', 'due_at' => now()->subDay()]);
        $notYet = ErasureRequest::create(['name' => 'Brian', 'email' => 'brian@example.com']);

        $this->artisan('okjt:retention')->assertSuccessful();

        $this->assertSame('done', $request->fresh()->status);
        $this->assertSame('Completed automatically at the deadline. 1 contact message deleted.', $request->fresh()->outcome);
        $this->assertSame('received', $notYet->fresh()->status);
        $this->assertSame(0, ContactMessage::count());
    }

    public function test_per_workspace_requests_stay_in_their_workspace_and_erase_there(): void
    {
        config()->set('okjt.privacy.per_workspace', true);
        config()->set('okjt.contact.per_workspace', true);
        config()->set('okjt.privacy.auto_complete', true);
        $garden = Project::create(['name' => 'Garden', 'slug' => 'garden']);
        $shop = Project::create(['name' => 'Shop', 'slug' => 'shop']);
        CurrentWorkspace::run($garden, fn () => $this->message('amina@example.com'));
        CurrentWorkspace::run($shop, fn () => $this->message('amina@example.com'));
        $request = CurrentWorkspace::run($garden, fn () => ErasureRequest::create(['name' => 'Amina', 'email' => 'amina@example.com', 'due_at' => now()->subDay()]));

        $this->assertNull(CurrentWorkspace::run($shop, fn () => ErasureRequest::find($request->id)));

        $this->artisan('okjt:retention')->assertSuccessful();

        $this->assertSame(0, CurrentWorkspace::run($garden, fn () => ContactMessage::count()));
        $this->assertSame(1, CurrentWorkspace::run($shop, fn () => ContactMessage::count()));
    }
}

class SpyEraser implements Eraser
{
    public ?ErasureRequest $seen = null;

    public function erase(ErasureRequest $request): ?string
    {
        $this->seen = $request;

        return 'guest record anonymised';
    }
}

class FailingEraser implements Eraser
{
    public function erase(ErasureRequest $request): ?string
    {
        throw new \RuntimeException('Storage was unavailable');
    }
}
