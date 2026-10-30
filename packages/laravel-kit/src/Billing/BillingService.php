<?php

namespace Okjt\Kit\Billing;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use InvalidArgumentException;

/**
 * Buying a plan: start a Paystack checkout, then — whether the payer comes
 * back to the app or Paystack's webhook arrives first — record the payment and
 * switch the plan on, exactly once per payment.
 */
class BillingService
{
    public function __construct(private PaystackService $paystack) {}

    /** Returns the Paystack page to send the payer to. */
    public function checkout(Model $account, Model $payer, string $plan, string $callbackUrl): string
    {
        if (! Plans::purchasable($plan, $account)) {
            throw new InvalidArgumentException('This plan isn’t available for your account.');
        }
        $price = Plans::get($plan)['price'];
        $payment = $this->payments()::create([
            'account_id' => $account->id,
            'user_id' => $payer->id,
            'reference' => Settings::get('reference_prefix', 'pay_').Str::lower(Str::random(20)),
            'plan' => $plan,
            'amount' => $price * 100,
            'currency' => Settings::get('currency'),
            'status' => Payment::STATUS_PENDING,
        ]);

        return $this->paystack->initialize($payer->email, $payment->amount, $payment->currency, $payment->reference, $callbackUrl, [
            'account_id' => $account->id,
            'plan' => $plan,
        ]);
    }

    /** Ask Paystack about a payment and apply it (the payer's return to the app). */
    public function confirm(string $reference): ?Model
    {
        $payment = $this->payments()::where('reference', $reference)->first();
        if (! $payment) {
            return null;
        }
        if ($payment->status !== Payment::STATUS_PENDING) {
            return $payment;
        }

        return $this->apply($this->paystack->verify($reference));
    }

    /**
     * Apply Paystack's word on a transaction (verify result or charge.success
     * webhook). Idempotent; a payment whose amount or currency doesn't match
     * what we asked for never activates anything.
     */
    public function apply(array $transaction): ?Model
    {
        $reference = (string) ($transaction['reference'] ?? '');

        return DB::transaction(function () use ($reference, $transaction) {
            $payment = $this->payments()::where('reference', $reference)->lockForUpdate()->first();
            if (! $payment || $payment->status === Payment::STATUS_SUCCESS) {
                return $payment;
            }

            $paid = ($transaction['status'] ?? null) === 'success';
            $matches = (int) ($transaction['amount'] ?? -1) === $payment->amount
                && strtoupper((string) ($transaction['currency'] ?? '')) === strtoupper($payment->currency);
            if (! $paid || ! $matches) {
                if ($paid && ! $matches) {
                    Log::warning('Paystack payment does not match what was asked for', ['reference' => $reference]);
                }
                // Paid the wrong amount, or Paystack says it failed: never activates.
                $failed = $paid || in_array($transaction['status'] ?? null, ['failed', 'abandoned', 'reversed'], true);
                $payment->update([
                    'status' => $failed ? Payment::STATUS_FAILED : Payment::STATUS_PENDING,
                    'gateway_response' => $this->keep($transaction),
                ]);

                return $payment;
            }

            $payment->update([
                'status' => Payment::STATUS_SUCCESS,
                'channel' => $transaction['channel'] ?? null,
                'paid_at' => isset($transaction['paid_at']) ? Carbon::parse($transaction['paid_at']) : now(),
                'gateway_response' => $this->keep($transaction),
            ]);
            $this->activate(config('okjt.accounts.model')::findOrFail($payment->account_id), $payment->plan);

            DB::afterCommit(fn () => $this->sendReceipt($payment));

            return $payment;
        });
    }

    /** One-off plans last for good; monthly ones add their months (from today, or from a later end date). */
    public function activate(Model $account, string $plan): void
    {
        $period = Plans::get($plan)['period'] ?? null;
        $expires = null;
        if (is_int($period)) {
            $from = ($account->plan === $plan && $account->plan_expires_at?->isFuture()) ? $account->plan_expires_at : now();
            $expires = $from->copy()->addMonthsNoOverflow($period);
        }
        $account->forceFill(['plan' => $plan, 'plan_expires_at' => $expires])->save();
    }

    private function sendReceipt(Model $payment): void
    {
        $mail = Settings::get('receipt_mail');
        $to = $payment->user_id ? config('okjt.user_model')::find($payment->user_id)?->email : null;
        if (! $mail || ! $to) {
            return;
        }
        try {
            Mail::to($to)->send(new $mail($payment));
        } catch (\Throwable $e) {
            Log::warning('Payment receipt email failed: '.$e->getMessage());
        }
    }

    /** @return class-string<Payment> */
    private function payments(): string
    {
        return config('okjt.billing.payment_model');
    }

    /** What we keep of Paystack's answer: enough to trace it, no card details. */
    private function keep(array $t): array
    {
        return array_intersect_key($t, array_flip(['id', 'status', 'reference', 'amount', 'currency', 'channel', 'paid_at', 'gateway_response']));
    }
}
