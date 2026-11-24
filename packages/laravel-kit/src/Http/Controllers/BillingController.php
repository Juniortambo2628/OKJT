<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
use Okjt\Kit\Billing\BillingService;
use Okjt\Kit\Billing\Payment;
use Okjt\Kit\Billing\PaystackService;
use Okjt\Kit\Billing\Plans;
use Okjt\Kit\Billing\Settings;
use Okjt\Kit\Support\ApiResponse;
use Okjt\Kit\Support\Messages;
use RuntimeException;

/**
 * Plans and payments (Paystack) for the account you own:
 *
 *   GET  /plans                          (public) the plans, for a pricing page
 *   GET  /billing                        your plan, limits, usage, plans to buy, receipts
 *   POST /billing/checkout  { plan }     → authorization_url (send the payer there)
 *   GET  /billing/verify    ?reference=  the payer is back: confirm and switch the plan on
 *   POST /paystack/webhook               (public, signed) charge.success
 *
 * Projects add what usage the billing page shows (usage).
 */
class BillingController extends Controller
{
    use ApiResponse;

    /** Public: the plans, for the landing page. */
    public function plans(): JsonResponse
    {
        return $this->successResponse([
            'billing_enabled' => Plans::billingEnabled(),
            'currency' => Settings::get('currency'),
            'plans' => Plans::catalogue(),
            'trial' => Plans::get(Plans::TRIAL)['limits'],
        ]);
    }

    public function show(Request $request): JsonResponse
    {
        $account = $this->ownedAccount($request);
        if (! $account) {
            return $this->notFoundResponse(Messages::get('no_account'));
        }
        $plan = Plans::current($account);

        return $this->successResponse([
            'account' => ['id' => $account->id, 'name' => $account->name, 'type' => $account->type],
            'billing_enabled' => Plans::billingEnabled(),
            'plan' => ['id' => $plan, 'name' => Plans::get($plan)['name'], 'expires_at' => $plan === $account->plan ? $account->plan_expires_at?->toISOString() : null],
            'limits' => Plans::get($plan)['limits'],
            'usage' => $this->usage($account),
            'available' => collect(Plans::catalogue())->filter(fn ($p) => Plans::purchasable($p['id'], $account))->values()->all(),
            'receipts' => $this->payments()::where('account_id', $account->id)->where('status', Payment::STATUS_SUCCESS)->latest('paid_at')->get()->map->receipt()->all(),
        ]);
    }

    public function checkout(Request $request, BillingService $billing): JsonResponse
    {
        $validated = $request->validate(['plan' => 'required|string|max:30']);
        $account = $this->ownedAccount($request);
        if (! $account) {
            return $this->forbiddenResponse('Only the account’s owner can buy a plan.');
        }

        try {
            $url = $billing->checkout($account, $request->user(), $validated['plan'], $this->returnUrl());
        } catch (InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        } catch (RuntimeException $e) {
            Log::error('Paystack checkout failed: '.$e->getMessage());

            return $this->errorResponse('Payments are unavailable right now. Please try again shortly.', 503);
        }

        return $this->successResponse(['authorization_url' => $url]);
    }

    /** The payer is back from Paystack (?reference=…): check it and switch the plan on. */
    public function verify(Request $request, BillingService $billing): JsonResponse
    {
        $validated = $request->validate(['reference' => 'required|string|max:64']);
        $account = $this->ownedAccount($request);
        $payment = $this->payments()::where('reference', $validated['reference'])->first();
        if (! $account || ! $payment || $payment->account_id !== $account->id) {
            return $this->notFoundResponse('Payment not found');
        }

        try {
            $payment = $billing->confirm($payment->reference);
        } catch (RuntimeException $e) {
            Log::warning('Paystack verify failed: '.$e->getMessage());

            return $this->errorResponse('We couldn’t confirm the payment yet. If you were charged, it will show here shortly.', 503);
        }

        return $this->successResponse($payment->receipt());
    }

    /** Paystack → the app. Signed; only charge.success matters. */
    public function webhook(Request $request, PaystackService $paystack, BillingService $billing): JsonResponse
    {
        if (! $paystack->validSignature($request->getContent(), $request->header('X-Paystack-Signature'))) {
            return response()->json(['message' => 'Invalid signature'], 401);
        }
        if ($request->input('event') === 'charge.success') {
            $billing->apply((array) $request->input('data', []));
        }

        return response()->json(['received' => true]);
    }

    // ---- What a project changes ---------------------------------------------

    /** What the billing page shows as used: by default the account's workspaces and each one's collaborators. */
    protected function usage(Model $account): array
    {
        $limits = config('okjt.billing.limits');

        return [
            'workspaces' => $limits::used('workspaces', $account),
            'per_workspace' => $account->workspaces()->orderBy('name')->get()->map(fn (Model $w) => [
                'id' => $w->id,
                'name' => $w->name,
                'collaborators' => $limits::used('collaborators', $account, $w),
            ])->all(),
        ];
    }

    /** The account billing is for: the first one you own. */
    protected function ownedAccount(Request $request): ?Model
    {
        return $request->user()->ownedAccount();
    }

    /** Where Paystack sends the payer back to. */
    protected function returnUrl(): string
    {
        return rtrim(config('app.frontend_url') ?: config('app.url'), '/').Settings::get('return_path', '/billing');
    }

    /** @return class-string<Payment> */
    private function payments(): string
    {
        return config('okjt.billing.payment_model');
    }
}
