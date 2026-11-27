<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Okjt\Kit\Console\AuditLog;
use Okjt\Kit\Http\Controllers\MpesaController;
use Okjt\Kit\Http\Controllers\MpesaSettingsController;
use Okjt\Kit\Http\Middleware\EnsureSuperadmin;
use Okjt\Kit\Payments\Mpesa\DarajaGateway;
use Okjt\Kit\Payments\Mpesa\FakeMpesaGateway;
use Okjt\Kit\Payments\Mpesa\Mpesa;
use Okjt\Kit\Payments\Mpesa\MpesaAccount;
use Okjt\Kit\Payments\Mpesa\MpesaException;
use Okjt\Kit\Payments\Mpesa\MpesaGateway;
use Okjt\Kit\Payments\Mpesa\MpesaPayment;
use Okjt\Kit\Payments\Mpesa\MpesaPaymentSettled;
use Okjt\Kit\Payments\Mpesa\Shortcode;
use Okjt\Kit\Tests\Fixtures\Project;
use Okjt\Kit\Tests\TestCase;
use Okjt\Kit\Workspace\CurrentWorkspace;

/** M-Pesa prompts (R5), taking the strongest of Naoa, naoa-dt and Tena-host. */
class MpesaTest extends TestCase
{
    private FakeMpesaGateway $fake;

    protected function defineEnvironment($app): void
    {
        parent::defineEnvironment($app);
        $app['config']->set('app.url', 'https://shop.test');
        $app['config']->set('okjt.switches', ['mpesa' => ['label' => 'M-Pesa', 'default' => true]]);
        $app['config']->set('okjt.mpesa.consumer_key', 'env-key');
        $app['config']->set('okjt.mpesa.consumer_secret', 'env-secret');
        $app['config']->set('okjt.mpesa.shortcode', '174379');
        $app['config']->set('okjt.mpesa.passkey', 'env-passkey');
    }

    protected function defineRoutes($router): void
    {
        $router->post('/api/mpesa/callback/{token}', [MpesaController::class, 'callback']);
        $router->get('/api/mpesa/payments/{id}', [MpesaController::class, 'show']);
        $router->get('/api/mpesa/shortcode', [MpesaSettingsController::class, 'workspaceShow']);
        $router->put('/api/mpesa/shortcode', [MpesaSettingsController::class, 'workspaceUpdate']);
        $router->middleware(EnsureSuperadmin::class)->group(function () use ($router) {
            $router->get('/api/admin/mpesa', [MpesaSettingsController::class, 'show']);
            $router->put('/api/admin/mpesa', [MpesaSettingsController::class, 'update']);
            $router->post('/api/admin/mpesa/workspaces/{workspace}/approve', [MpesaSettingsController::class, 'approve']);
        });
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->app->instance(MpesaGateway::class, $this->fake = new FakeMpesaGateway);
    }

    private function mpesa(): Mpesa
    {
        return app(Mpesa::class);
    }

    private function admin()
    {
        $user = $this->person('admin@example.com');
        $user->forceFill(['is_superadmin' => true])->save();

        return $user;
    }

    private function answer(MpesaPayment $payment, array $body)
    {
        return $this->postJson('/api/mpesa/callback/'.$payment->callback_token, $body);
    }

    private function token(MpesaPayment $payment): string
    {
        return DB::table('okjt_mpesa_payments')->where('id', $payment->id)->value('callback_token');
    }

    // Starting a prompt

    public function test_a_prompt_goes_to_the_paybill_with_an_address_of_its_own(): void
    {
        $payment = $this->mpesa()->start('0712 345 678', 1500, 'order #42', 'Extras', null, ['order' => 42], 7);

        $push = $this->fake->pushes[0];
        $this->assertSame(['174379', '254712345678', 1500, 'ORDER42', 'Extras'], [$push['to']->number, $push['phone'], $push['amount'], $push['reference'], $push['description']]);
        $this->assertSame('https://shop.test/api/mpesa/callback/'.$this->token($payment), $push['callback_url']);
        $this->assertSame(48, strlen($this->token($payment)));
        $this->assertSame(['pending', 'ws_CO_fake_1', 7], [$payment->status, $payment->checkout_request_id, $payment->requested_by]);
        $this->assertArrayNotHasKey('callback_token', $payment->toArray());
    }

    public function test_nothing_is_sent_while_m_pesa_is_off_or_not_set_up(): void
    {
        config()->set('okjt.switches.mpesa.default', false);
        $this->assertMpesaRefuses(fn () => $this->mpesa()->start('0712345678', 100), 503, 'switched off');

        config()->set('okjt.switches.mpesa.default', true);
        config()->set('okjt.mpesa.passkey', null);
        $this->assertMpesaRefuses(fn () => $this->mpesa()->start('0712345678', 100), 503, "isn't set up");
        $this->assertSame([], $this->fake->pushes);
    }

    public function test_the_number_and_amount_are_checked(): void
    {
        $this->assertMpesaRefuses(fn () => $this->mpesa()->start('0812 345 678', 100), 422, 'Safaricom number');
        $this->assertMpesaRefuses(fn () => $this->mpesa()->start('0112345678', 0), 422, 'between KES 1 and KES 250,000');
        $this->assertMpesaRefuses(fn () => $this->mpesa()->start('0112345678', 250001), 422, 'between');
        $this->assertSame('254112345678', $this->mpesa()->start('+254 112 345 678', 10)->phone);
    }

    public function test_a_second_prompt_within_two_minutes_is_refused(): void
    {
        $order = Project::create(['name' => 'Order', 'slug' => 'order-1']);
        $this->mpesa()->start('0712345678', 500, null, null, $order);
        $this->assertMpesaRefuses(fn () => $this->mpesa()->start('0799999999', 900, null, null, $order), 429, 'just sent');

        $this->travel(121)->seconds();
        $this->mpesa()->start('0712345678', 500, null, null, $order);
        $this->assertCount(2, $this->fake->pushes);
    }

    public function test_a_refused_prompt_is_recorded_as_failed(): void
    {
        $this->fake->refuse = "M-Pesa couldn't send the prompt.";
        $this->assertMpesaRefuses(fn () => $this->mpesa()->start('0712345678', 100), 502, "couldn't send");
        $this->assertSame('failed', MpesaPayment::sole()->status);
    }

    // M-Pesa's answer

    public function test_a_paid_answer_is_recorded_once_and_announced_once(): void
    {
        Event::fake([MpesaPaymentSettled::class]);
        $payment = $this->mpesa()->start('0712345678', 1500);
        $body = $this->fake->callbackBody(0, 1500, 'TKA1B2C3D4');
        $payment->callback_token = $this->token($payment);

        $this->answer($payment, $body)->assertOk()->assertExactJson(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        $this->answer($payment, $body)->assertOk();

        $payment->refresh();
        $this->assertSame(['paid', 'TKA1B2C3D4'], [$payment->status, $payment->mpesa_receipt]);
        $this->assertSame('2026-11-25 07:30:45', $payment->paid_at->utc()->format('Y-m-d H:i:s'));
        Event::assertDispatchedTimes(MpesaPaymentSettled::class, 1);
    }

    public function test_an_answer_that_isnt_ours_records_nothing(): void
    {
        Event::fake([MpesaPaymentSettled::class]);
        $payment = $this->mpesa()->start('0712345678', 1500);
        $payment->callback_token = $this->token($payment);

        $this->postJson('/api/mpesa/callback/'.str_repeat('x', 48), $this->fake->callbackBody())->assertOk()->assertJson(['ResultCode' => 0]);
        $this->answer($payment, $this->fake->callbackBody(0, 1500, 'TKA1', 'ws_CO_someone_else'))->assertOk();
        $this->answer($payment, ['Body' => []])->assertOk();

        $this->assertSame('pending', $payment->fresh()->status);
        Event::assertNotDispatched(MpesaPaymentSettled::class);
    }

    public function test_a_paid_answer_for_another_amount_is_recorded_as_failed(): void
    {
        $payment = $this->mpesa()->start('0712345678', 1500);
        $payment->callback_token = $this->token($payment);
        $this->answer($payment, $this->fake->callbackBody(0, 15));

        $payment->refresh();
        $this->assertSame(['failed', 'Amount mismatch', null], [$payment->status, $payment->result_desc, $payment->mpesa_receipt]);
    }

    public function test_cancelled_and_no_answer_on_the_phone(): void
    {
        $cancelled = $this->mpesa()->start('0712345678', 100);
        $cancelled->callback_token = $this->token($cancelled);
        $this->answer($cancelled, $this->fake->callbackBody(1032));
        $this->assertSame(['cancelled', 'Request cancelled by user'], [$cancelled->fresh()->status, $cancelled->fresh()->result_desc]);
        $this->assertSame('timed_out', MpesaPayment::statusFor('1037'));
        $this->assertSame('failed', MpesaPayment::statusFor('2001'));
    }

    // Answers that never came

    public function test_reconcile_asks_m_pesa_and_times_out_unanswered_prompts(): void
    {
        $paid = $this->mpesa()->start('0712345678', 100);
        $waiting = $this->mpesa()->start('0712345679', 200);
        $this->fake->answers[$paid->checkout_request_id] = ['pending' => false, 'result_code' => '0', 'result_desc' => 'Paid'];

        $this->travel(30)->seconds();
        $this->assertSame(0, $this->mpesa()->reconcile()['checked']); // too soon

        $this->travel(40)->seconds();
        $this->artisan('okjt:mpesa-reconcile')->expectsOutput('Checked 2, resolved 1.')->assertSuccessful();
        $this->assertSame(['paid', 'pending'], [$paid->fresh()->status, $waiting->fresh()->status]);

        $this->travel(5)->minutes();
        $this->mpesa()->reconcile();
        $this->assertSame(['timed_out', 'No answer from the phone'], [$waiting->fresh()->status, $waiting->fresh()->result_desc]);
    }

    public function test_a_late_paid_answer_overturns_a_timeout_we_inferred(): void
    {
        Event::fake([MpesaPaymentSettled::class]);
        $payment = $this->mpesa()->start('0712345678', 100);
        $this->mpesa()->expire($payment);
        $payment->callback_token = $this->token($payment);

        $this->answer($payment, $this->fake->callbackBody(0, 100, 'TKLATE1234'));

        $this->assertSame(['paid', 'TKLATE1234'], [$payment->fresh()->status, $payment->fresh()->mpesa_receipt]);
        Event::assertDispatchedTimes(MpesaPaymentSettled::class, 2);
    }

    public function test_a_cancelled_answer_doesnt_overturn_a_timeout_m_pesa_reported(): void
    {
        $payment = $this->mpesa()->start('0712345678', 100);
        $payment->callback_token = $this->token($payment);
        $this->answer($payment, $this->fake->callbackBody(1032));
        $this->answer($payment, $this->fake->callbackBody(0, 100));
        $this->assertSame('cancelled', $payment->fresh()->status);
    }

    public function test_the_kit_runs_reconcile_every_minute_where_m_pesa_is_declared(): void
    {
        $event = collect(app(Schedule::class)->events())->first(fn ($e) => str_contains((string) $e->command, 'okjt:mpesa-reconcile'));
        $this->assertSame('* * * * *', $event?->expression);
    }

    public function test_a_project_without_the_m_pesa_switch_or_with_reconcile_off_schedules_nothing(): void
    {
        foreach ([['okjt.switches', []], ['okjt.mpesa.reconcile', false]] as [$key, $value]) {
            config()->set('okjt.switches', ['mpesa' => ['label' => 'M-Pesa', 'default' => true]]);
            config()->set('okjt.mpesa.reconcile', true);
            config()->set($key, $value);
            app()->forgetInstance(Schedule::class);
            $this->assertNull(collect(app(Schedule::class)->events())->first(fn ($e) => str_contains((string) $e->command, 'okjt:mpesa-reconcile')), $key);
        }
    }

    // Paying more than one place

    public function test_a_named_payee_is_paid_at_its_own_paybill_and_asked_there_later(): void
    {
        $this->app->instance(\Okjt\Kit\Payments\Mpesa\PayeeShortcodes::class, new VendorPaybills);
        $payment = $this->mpesa()->start('0712345678', 700, 'NAOA3', 'Wedding', null, [], null, 'storefront:12');

        $this->assertSame(['888880', 'vendor-12-passkey'], [$this->fake->pushes[0]['to']->number, $this->fake->pushes[0]['to']->passkey]);
        $this->assertSame('storefront:12', $payment->payee);

        $seen = null;
        $this->fake->answers[$payment->checkout_request_id] = ['pending' => false, 'result_code' => '0', 'result_desc' => 'Paid'];
        $gateway = new class($this->fake, $seen) implements MpesaGateway
        {
            public function __construct(private FakeMpesaGateway $fake, public ?string &$seen) {}

            public function push(Shortcode $to, string $phone, int $amount, string $reference, string $description, string $callbackUrl): array
            {
                return $this->fake->push($to, $phone, $amount, $reference, $description, $callbackUrl);
            }

            public function query(Shortcode $to, string $checkoutRequestId): ?array
            {
                $this->seen = $to->number;

                return $this->fake->query($to, $checkoutRequestId);
            }
        };
        $this->app->instance(MpesaGateway::class, $gateway);
        $this->travel(2)->minutes();
        $this->mpesa()->reconcile();

        $this->assertSame('888880', $seen);
        $this->assertSame('paid', $payment->fresh()->status);
    }

    public function test_without_a_projects_payee_class_a_named_payee_is_refused_not_sent_to_the_apps_paybill(): void
    {
        $this->assertMpesaRefuses(fn () => $this->mpesa()->start('0712345678', 700, null, null, null, [], null, 'storefront:12'), 503, "isn't set up");
        $this->assertSame([], $this->fake->pushes);
    }

    public function test_a_payee_that_cant_be_paid_now_is_refused(): void
    {
        $this->app->instance(\Okjt\Kit\Payments\Mpesa\PayeeShortcodes::class, new VendorPaybills);
        $this->assertMpesaRefuses(fn () => $this->mpesa()->start('0712345678', 700, null, null, null, [], null, 'storefront:99'), 503, "isn't set up");
    }

    // Following a prompt

    public function test_only_whoever_sent_a_prompt_can_follow_it(): void
    {
        $sender = $this->person('sender@example.com');
        $payment = $this->mpesa()->start('0712345678', 100, null, null, null, [], $sender->id);

        $this->actingAs($sender)->getJson("/api/mpesa/payments/{$payment->id}")->assertOk()->assertJsonPath('data.status', 'pending')->assertJsonMissingPath('data.callback_token');
        $this->actingAs($this->person('other@example.com'))->getJson("/api/mpesa/payments/{$payment->id}")->assertNotFound();
        $this->actingAs($this->admin())->getJson("/api/mpesa/payments/{$payment->id}")->assertOk();
    }

    // Settings in the admin

    public function test_settings_saved_in_the_admin_win_are_encrypted_and_never_returned(): void
    {
        $this->actingAs($this->admin());
        $this->getJson('/api/admin/mpesa')->assertOk()->assertJsonPath('data.shortcode', '174379')->assertJsonPath('data.from_admin', false);

        $this->putJson('/api/admin/mpesa', ['env' => 'production', 'consumer_key' => 'admin-key', 'consumer_secret' => 'admin-secret', 'shortcode' => '600100', 'type' => 'till', 'till_number' => '5001234', 'passkey' => 'admin-passkey'])
            ->assertOk()->assertJsonPath('data.env', 'production')->assertJsonPath('data.consumer_secret_set', true)->assertJsonPath('data.passkey_set', true)
            ->assertJsonMissingPath('data.passkey')->assertJsonMissingPath('data.consumer_secret');

        $raw = DB::table('okjt_mpesa_accounts')->first();
        $this->assertNotSame('admin-passkey', $raw->passkey);
        $this->assertSame('admin-passkey', MpesaAccount::forApp()->passkey);
        $this->assertStringNotContainsString('admin-', json_encode(AuditLog::sole()->details));
        $this->assertSame(['env', 'consumer_key', 'shortcode', 'type', 'till_number', 'consumer_secret', 'passkey'], AuditLog::sole()->details['fields']);

        // A blank secret keeps the saved one.
        $this->putJson('/api/admin/mpesa', ['env' => 'production', 'consumer_key' => 'admin-key', 'shortcode' => '600100', 'type' => 'till', 'till_number' => '5001234', 'passkey' => ''])->assertOk();
        $this->assertSame('admin-passkey', MpesaAccount::forApp()->passkey);

        $this->mpesa()->start('0712345678', 100);
        $this->assertSame(['600100', 'admin-passkey', '5001234'], [$this->fake->pushes[0]['to']->number, $this->fake->pushes[0]['to']->passkey, $this->fake->pushes[0]['to']->receiver()]);
    }

    public function test_only_superadmins_see_the_settings(): void
    {
        $this->actingAs($this->person('host@example.com'))->getJson('/api/admin/mpesa')->assertForbidden();
    }

    // Each workspace's own paybill

    public function test_per_workspace_uses_only_an_approved_paybill_of_the_workspaces_own(): void
    {
        config()->set('okjt.mpesa.per_workspace', true);
        $vendor = Project::create(['name' => 'Vendor', 'slug' => 'vendor']);
        $this->actingAs($this->person('vendor@example.com'));

        // Never the app's paybill: that would send the vendor's money to the platform.
        CurrentWorkspace::run($vendor, fn () => $this->assertMpesaRefuses(fn () => $this->mpesa()->start('0712345678', 100), 503, "isn't set up"));

        CurrentWorkspace::run($vendor, fn () => $this->putJson('/api/mpesa/shortcode', ['shortcode' => '888880', 'type' => 'paybill', 'passkey' => 'vendor-passkey'])
            ->assertOk()->assertJsonPath('data.approved', false)->assertJsonMissingPath('data.passkey'));
        CurrentWorkspace::run($vendor, fn () => $this->assertMpesaRefuses(fn () => $this->mpesa()->start('0712345678', 100), 503, "isn't set up"));

        $this->actingAs($this->admin())->postJson("/api/admin/mpesa/workspaces/{$vendor->id}/approve")->assertOk()->assertJsonPath('data.approved', true);

        $seen = null;
        Event::listen(MpesaPaymentSettled::class, function () use (&$seen) {
            $seen = CurrentWorkspace::id();
        });
        $payment = CurrentWorkspace::run($vendor, fn () => $this->mpesa()->start('0712345678', 100));
        $this->assertSame(['888880', $vendor->id], [$this->fake->pushes[0]['to']->number, $payment->workspace_id]);

        // M-Pesa's answer carries no workspace: it is recorded inside the payment's own.
        $payment->callback_token = $this->token($payment);
        $this->answer($payment, $this->fake->callbackBody(0, 100));
        $this->assertSame($vendor->id, $seen);

        // Changing the paybill needs approval again.
        CurrentWorkspace::run($vendor, fn () => $this->putJson('/api/mpesa/shortcode', ['shortcode' => '888881', 'type' => 'paybill'])->assertOk()->assertJsonPath('data.approved', false));
    }

    // Daraja itself

    public function test_daraja_signs_in_once_and_builds_the_prompt_as_documented(): void
    {
        $this->travelTo(\Illuminate\Support\Carbon::parse('2026-11-25 07:30:45', 'UTC'));
        Http::fake([
            '*/oauth/v1/generate*' => Http::response(['access_token' => 'tok', 'expires_in' => '3599']),
            '*/mpesa/stkpush/v1/processrequest' => Http::response(['ResponseCode' => '0', 'MerchantRequestID' => 'm1', 'CheckoutRequestID' => 'ws_CO_1']),
            '*/mpesa/stkpushquery/v1/query' => Http::response(['errorCode' => '500.001.1001', 'errorMessage' => 'The transaction is being processed']),
        ]);
        $daraja = app(DarajaGateway::class);
        $till = new Shortcode('600100', 'pk', 'till', '5001234');

        $this->assertSame(['merchant_request_id' => 'm1', 'checkout_request_id' => 'ws_CO_1'], $daraja->push($till, '254712345678', 100, 'ORDER42', 'Extras for the room', 'https://shop.test/cb/x'));
        $daraja->push($till, '254712345678', 100, 'ORDER43', 'Extras', 'https://shop.test/cb/y');
        $this->assertSame(['pending' => true, 'result_code' => null, 'result_desc' => null], $daraja->query($till, 'ws_CO_1'));

        Http::assertSentCount(4); // one sign-in, two prompts, one query
        Http::assertSent(fn ($r) => str_contains($r->url(), 'sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest') && $r['TransactionType'] === 'CustomerBuyGoodsOnline'
            && $r['BusinessShortCode'] === '600100' && $r['PartyB'] === '5001234' && $r['Timestamp'] === '20261125103045'
            && $r['Password'] === base64_encode('600100pk20261125103045') && $r['TransactionDesc'] === 'Extras for th');
    }

    public function test_daraja_refusing_says_so_without_the_details(): void
    {
        Http::fake([
            '*/oauth/v1/generate*' => Http::response(['access_token' => 'tok', 'expires_in' => '3599']),
            '*/mpesa/stkpush/v1/processrequest' => Http::response(['errorCode' => '400.002.02', 'errorMessage' => 'Bad Request - Invalid PhoneNumber'], 400),
        ]);
        $this->assertMpesaRefuses(fn () => app(DarajaGateway::class)->push(new Shortcode('174379', 'pk'), '254712345678', 1, 'R', 'D', 'https://x'), 502, 'Check the phone number');
    }

    private function assertMpesaRefuses(callable $run, int $status, string $says): void
    {
        try {
            $run();
            $this->fail('Expected M-Pesa to refuse');
        } catch (MpesaException $e) {
            $this->assertSame($status, $e->status);
            $this->assertStringContainsString($says, $e->getMessage());
        }
    }
}

class VendorPaybills implements \Okjt\Kit\Payments\Mpesa\PayeeShortcodes
{
    public function shortcodeFor(?string $payee, ?int $workspaceId): ?Shortcode
    {
        return $payee === 'storefront:12' ? new Shortcode('888880', 'vendor-12-passkey') : null;
    }
}
