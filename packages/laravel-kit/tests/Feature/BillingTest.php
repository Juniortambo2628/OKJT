<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Http;
use Okjt\Kit\Billing\Limits;
use Okjt\Kit\Billing\Payment;
use Okjt\Kit\Billing\PlanLimitReached;
use Okjt\Kit\Billing\Plans;
use Okjt\Kit\Http\Controllers\BillingController;
use Okjt\Kit\Tests\Fixtures\Account;
use Okjt\Kit\Tests\Fixtures\Project;
use Okjt\Kit\Tests\Fixtures\User;
use Okjt\Kit\Tests\TestCase;
use Okjt\Kit\Workspace\CurrentWorkspace;

class BillingTest extends TestCase
{
    private Account $account;

    private User $owner;

    protected function defineEnvironment($app): void
    {
        parent::defineEnvironment($app);
        $app['config']->set('okjt.billing.enabled', true);
        $app['config']->set('okjt.billing.plans.pro', ['name' => 'Pro', 'for' => [], 'price' => 1500, 'period' => 1, 'limits' => ['workspaces' => 10, 'collaborators' => 10]]);
        $app['config']->set('okjt.billing.paystack', ['secret_key' => 'sk_test', 'base_url' => 'https://paystack.test']);
    }

    protected function defineRoutes($router): void
    {
        $router->get('/api/plans', [BillingController::class, 'plans']);
        $router->get('/api/billing', [BillingController::class, 'show']);
        $router->post('/api/billing/checkout', [BillingController::class, 'checkout']);
        $router->get('/api/billing/verify', [BillingController::class, 'verify']);
        $router->post('/api/paystack/webhook', [BillingController::class, 'webhook']);
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->account = Account::create(['name' => 'Bloom Co']);
        $this->owner = $this->person('owner@example.com');
        $this->account->members()->attach($this->owner->id, ['role' => 'owner']);
        $this->actingAs($this->owner);
    }

    private function checkout(): Payment
    {
        Http::fake(['paystack.test/transaction/initialize' => Http::response(['status' => true, 'data' => ['authorization_url' => 'https://checkout.paystack.test/abc']])]);
        $this->postJson('/api/billing/checkout', ['plan' => 'pro'])->assertOk()->assertJsonPath('data.authorization_url', 'https://checkout.paystack.test/abc');

        return Payment::sole();
    }

    public function test_limits_follow_the_plan_and_say_so(): void
    {
        $project = Project::create(['account_id' => $this->account->id, 'slug' => 'one']);
        $this->owner->setRoleIn($project, 'owner');
        $this->person('a@example.com')->setRoleIn($project, 'editor');

        CurrentWorkspace::run($project, function () {
            $this->assertSame('free', Plans::current($this->account));
            try {
                Limits::ensure('collaborators');
                $this->fail('The free plan allows two people.');
            } catch (PlanLimitReached $e) {
                $this->assertSame('Your plan includes up to 2 collaborators. Upgrade to add more.', $e->getMessage());
                $this->assertSame('plan_limit', $e->render()->getData(true)['reason']);
            }

            $this->account->forceFill(['plan' => 'pro', 'plan_expires_at' => now()->addMonth()])->save();
            Limits::ensure('collaborators');
        });

        // A paid plan that ran out falls back to the default.
        $this->account->forceFill(['plan_expires_at' => now()->subDay()])->save();
        $this->assertSame('free', Plans::current($this->account));
    }

    public function test_while_billing_is_off_everyone_is_on_the_trial_and_nothing_is_for_sale(): void
    {
        config(['okjt.billing.enabled' => false]);

        $this->assertSame(Plans::TRIAL, Plans::current($this->account));
        $this->assertSame(3, Plans::limit($this->account, 'workspaces'));
        $this->assertFalse(Plans::purchasable('pro', $this->account));
        $this->assertSame('The trial includes up to 3 workspaces. Contact us for full access.', (new PlanLimitReached('workspaces', 3))->getMessage());
        $this->getJson('/api/plans')->assertOk()->assertJsonPath('data.billing_enabled', false)->assertJsonPath('data.plans.1.id', 'pro');
    }

    public function test_a_checkout_records_a_pending_payment_and_sends_the_payer_to_paystack(): void
    {
        $payment = $this->checkout();

        $this->assertSame(150000, $payment->amount);
        $this->assertSame('pending', $payment->status);
        $this->assertStringStartsWith('pay_', $payment->reference);
        Http::assertSent(fn (HttpRequest $r) => $r->hasHeader('Authorization', 'Bearer sk_test') && $r['amount'] === 150000 && $r['currency'] === 'KES');
    }

    public function test_coming_back_from_paystack_switches_the_plan_on_once(): void
    {
        $payment = $this->checkout();
        Http::fake(['paystack.test/transaction/verify/*' => Http::response(['status' => true, 'data' => [
            'reference' => $payment->reference, 'status' => 'success', 'amount' => 150000, 'currency' => 'KES', 'channel' => 'card', 'paid_at' => now()->toISOString(),
        ]])]);

        $this->getJson('/api/billing/verify?reference='.$payment->reference)->assertOk()->assertJsonPath('data.status', 'success');
        $this->getJson('/api/billing/verify?reference='.$payment->reference)->assertOk();

        $this->account->refresh();
        $this->assertSame('pro', $this->account->plan);
        // A month on, without overflowing (31 October → 30 November, not 1 December).
        $this->assertTrue($this->account->plan_expires_at->between(now()->addMonthNoOverflow()->subMinute(), now()->addMonthNoOverflow()->addMinute()));
        $this->getJson('/api/billing')->assertOk()
            ->assertJsonPath('data.plan.id', 'pro')
            ->assertJsonPath('data.receipts.0.amount', 1500)
            ->assertJsonPath('data.usage.workspaces', 0);
    }

    public function test_the_webhook_needs_paystacks_signature_and_a_matching_amount(): void
    {
        $payment = $this->checkout();
        $body = json_encode(['event' => 'charge.success', 'data' => ['reference' => $payment->reference, 'status' => 'success', 'amount' => 100, 'currency' => 'KES']]);

        $this->call('POST', '/api/paystack/webhook', [], [], [], ['CONTENT_TYPE' => 'application/json', 'HTTP_X_PAYSTACK_SIGNATURE' => 'forged'], $body)->assertUnauthorized();

        $signature = hash_hmac('sha512', $body, 'sk_test');
        $this->call('POST', '/api/paystack/webhook', [], [], [], ['CONTENT_TYPE' => 'application/json', 'HTTP_X_PAYSTACK_SIGNATURE' => $signature], $body)->assertOk();

        $this->assertSame('failed', $payment->fresh()->status);
        $this->assertNotSame('pro', $this->account->fresh()->plan);
    }

    public function test_settings_can_live_in_the_projects_own_config_file(): void
    {
        config(['shop.billing' => ['enabled' => false, 'trial_limits' => ['workspaces' => 7]], 'okjt.billing.settings_from' => 'shop.billing']);

        $this->assertSame(7, Plans::limit($this->account, 'workspaces'));
        $this->assertSame('pay_', \Okjt\Kit\Billing\Settings::get('reference_prefix'));
    }
}
