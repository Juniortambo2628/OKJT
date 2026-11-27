<?php

namespace Okjt\Kit\Payments\Mpesa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Okjt\Kit\Workspace\CurrentWorkspace;

/**
 * M-Pesa prompts (STK Push), from Naoa (StkPushService), naoa-dt
 * (MpesaService, MpesaPaymentRecorder, mpesa:reconcile) and Tena-host,
 * taking the strongest of each (CONSOLIDATION_PLAN R5):
 *
 * - start(): checks the number and the amount, refuses a repeat within two
 *   minutes, and sends the prompt with an address of its own.
 * - callback(): M-Pesa's answer counts only if its token, its
 *   CheckoutRequestID and, when paid, its amount all match the prompt.
 * - record(): the one place an outcome is saved, under a row lock, once;
 *   a late "paid" overturns a timeout we only inferred.
 * - reconcile(): asks M-Pesa about prompts whose answer never came.
 *
 *   $payment = app(Mpesa::class)->start('0712 345 678', 1500, 'ORDER42', 'Extras', $order);
 */
class Mpesa
{
    public function __construct(private MpesaGateway $gateway, private MpesaSettings $settings, private PayeeShortcodes $payees) {}

    /**
     * Send the prompt. $payable is what it pays for; $reference shows on the
     * payer's statement (12 letters and numbers at most). $payee names where
     * the money goes when a project pays more than one place (see
     * PayeeShortcodes); left out, it goes to the paybill in the settings.
     *
     * @throws MpesaException
     */
    public function start(string $phone, int $amount, ?string $reference = null, ?string $description = null, ?Model $payable = null, array $meta = [], ?int $requestedBy = null, ?string $payee = null): MpesaPayment
    {
        if (! $this->settings->isOn()) {
            throw new MpesaException('M-Pesa payments are switched off.', 503);
        }
        $workspaceId = config('okjt.mpesa.per_workspace') ? CurrentWorkspace::id() : null;
        $to = $this->payees->shortcodeFor($payee, $workspaceId);
        if (! $to || ! $this->settings->hasKeys()) {
            throw new MpesaException("M-Pesa isn't set up here yet.", 503);
        }
        $msisdn = self::msisdn($phone);
        if (! $msisdn) {
            throw new MpesaException('Enter a Safaricom number, e.g. 0712 345 678.');
        }
        [$min, $max] = [(int) config('okjt.mpesa.min_amount', 1), (int) config('okjt.mpesa.max_amount', 250000)];
        if ($amount < $min || $amount > $max) {
            throw new MpesaException('Enter an amount between KES '.number_format($min).' and KES '.number_format($max).'.');
        }
        if ($this->recentPrompt($msisdn, $amount, $payable)) {
            throw new MpesaException('A prompt was just sent. Check the phone, or wait two minutes to try again.', 429);
        }

        $payment = MpesaPayment::create([
            'payable_type' => $payable?->getMorphClass(),
            'payable_id' => $payable?->getKey(),
            'requested_by' => $requestedBy,
            'payee' => $payee,
            'phone' => $msisdn,
            'amount' => $amount,
            'account_reference' => self::reference($reference),
            'callback_token' => Str::random(48),
            'meta' => $meta ?: null,
        ]);

        try {
            $ids = $this->gateway->push($to, $msisdn, $amount, $payment->account_reference,
                $description ?: (string) config('okjt.mpesa.description', 'Payment'), $this->settings->callbackUrl($payment->callback_token));
        } catch (MpesaException $e) {
            $payment->update(['status' => MpesaPayment::FAILED, 'result_desc' => mb_substr($e->getMessage(), 0, 255)]);
            throw $e;
        }
        $payment->update($ids);

        return $payment;
    }

    /**
     * M-Pesa's answer to the prompt with this token. Returns false when it
     * isn't one of ours (unknown token, or a CheckoutRequestID that isn't the
     * prompt's): nothing is recorded.
     */
    public function callback(string $token, array $payload): bool
    {
        $result = $payload['Body']['stkCallback'] ?? null;
        $payment = strlen($token) === 48 ? MpesaPayment::query()->withoutGlobalScopes()->where('callback_token', $token)->first() : null;
        if (! is_array($result) || ! $payment || ! hash_equals($payment->callback_token, $token)
            || ! $payment->checkout_request_id || ! hash_equals($payment->checkout_request_id, (string) ($result['CheckoutRequestID'] ?? ''))) {
            Log::warning('M-Pesa callback ignored: not one of our prompts', ['payment' => $payment?->id]);

            return false;
        }

        $metadata = collect($result['CallbackMetadata']['Item'] ?? [])
            ->filter(fn ($item) => is_array($item) && isset($item['Name']) && array_key_exists('Value', $item))
            ->pluck('Value', 'Name')->all();
        $this->record($payment, (string) ($result['ResultCode'] ?? '-1'), $result['ResultDesc'] ?? null, $metadata);

        return true;
    }

    /**
     * Save an outcome, however it arrived (callback, query): under a row lock,
     * and only while the prompt is pending, so it is applied once. A "paid"
     * whose amount isn't the prompt's is recorded as failed (the payer can't
     * change a prompt's amount, so the answer isn't genuine).
     *
     * @param  array<string, mixed>  $metadata  CallbackMetadata as name => value
     */
    public function record(MpesaPayment $payment, string $resultCode, ?string $resultDesc = null, array $metadata = []): MpesaPayment
    {
        return $this->inWorkspace($payment->workspace_id, function () use ($payment, $resultCode, $resultDesc, $metadata) {
            $settled = false;
            $saved = DB::transaction(function () use ($payment, $resultCode, $resultDesc, $metadata, &$settled) {
                $locked = MpesaPayment::query()->withoutGlobalScopes()->whereKey($payment->getKey())->lockForUpdate()->firstOrFail();
                $status = MpesaPayment::statusFor($resultCode);
                $receipt = isset($metadata['MpesaReceiptNumber']) ? mb_substr((string) $metadata['MpesaReceiptNumber'], 0, 20) : null;
                $inferredTimeout = $locked->status === MpesaPayment::TIMED_OUT && $locked->result_code === null;

                if (! $locked->isPending() && ! ($inferredTimeout && $status === MpesaPayment::PAID)) {
                    // Already recorded; a late callback may still bring the receipt number.
                    if ($locked->isPaid() && ! $locked->mpesa_receipt && $receipt) {
                        $locked->update(['mpesa_receipt' => $receipt]);
                    }

                    return $locked;
                }

                if ($status === MpesaPayment::PAID && isset($metadata['Amount']) && (int) round((float) $metadata['Amount']) !== $locked->amount) {
                    Log::warning('M-Pesa callback amount mismatch', ['payment' => $locked->id]);
                    [$status, $resultDesc] = [MpesaPayment::FAILED, 'Amount mismatch'];
                }

                $updates = ['status' => $status, 'result_code' => $resultCode, 'result_desc' => $resultDesc ? mb_substr($resultDesc, 0, 255) : null];
                if ($status === MpesaPayment::PAID) {
                    $updates += ['mpesa_receipt' => $receipt, 'paid_at' => self::transactionDate($metadata['TransactionDate'] ?? null) ?? now()];
                }
                $locked->update($updates);
                $settled = true;

                return $locked;
            });

            if ($settled) {
                MpesaPaymentSettled::dispatch($saved);
            }

            return $saved;
        });
    }

    /** A prompt nobody answered: timed out (no money moved). A genuine "paid" arriving later still counts. */
    public function expire(MpesaPayment $payment, string $reason = 'No answer from the phone'): MpesaPayment
    {
        return $this->inWorkspace($payment->workspace_id, function () use ($payment, $reason) {
            $settled = false;
            $saved = DB::transaction(function () use ($payment, $reason, &$settled) {
                $locked = MpesaPayment::query()->withoutGlobalScopes()->whereKey($payment->getKey())->lockForUpdate()->firstOrFail();
                if ($locked->isPending()) {
                    $locked->update(['status' => MpesaPayment::TIMED_OUT, 'result_desc' => $reason]);
                    $settled = true;
                }

                return $locked;
            });
            if ($settled) {
                MpesaPaymentSettled::dispatch($saved);
            }

            return $saved;
        });
    }

    /**
     * Prompts still pending after a minute: ask M-Pesa, and time out those
     * nobody answered (okjt.mpesa.pending_timeout seconds). Returns how many
     * were checked and resolved.
     *
     * @return array{checked: int, resolved: int}
     */
    public function reconcile(int $limit = 50): array
    {
        $timeout = (int) config('okjt.mpesa.pending_timeout', 300);
        $checked = $resolved = 0;
        $pending = MpesaPayment::query()->withoutGlobalScopes()
            ->where('status', MpesaPayment::PENDING)
            ->where('created_at', '<=', now()->subMinute())
            ->where(fn ($q) => $q->whereNull('last_queried_at')->orWhere('last_queried_at', '<=', now()->subSeconds(50)))
            ->orderBy('id')->limit($limit)->get();

        foreach ($pending as $payment) {
            $checked++;
            if (! $payment->checkout_request_id) {
                $this->expire($payment, 'The prompt was not sent');
                $resolved++;

                continue;
            }
            $payment->update(['last_queried_at' => now()]);
            $to = $this->payees->shortcodeFor($payment->payee, $payment->workspace_id);
            $answer = $to ? $this->gateway->query($to, $payment->checkout_request_id) : null;
            if ($answer && ! $answer['pending'] && $answer['result_code'] !== null) {
                $this->record($payment, $answer['result_code'], $answer['result_desc']);
                $resolved++;
            } elseif ($payment->created_at->lte(now()->subSeconds($timeout))) {
                $this->expire($payment);
                $resolved++;
            }
        }

        return compact('checked', 'resolved');
    }

    /** "0712 345 678", "+254712345678", "712345678" → "254712345678"; null if it isn't a Kenyan mobile number. */
    public static function msisdn(?string $phone): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $phone);

        return preg_match('/^(?:254|0)?([17]\d{8})$/', $digits, $m) ? '254'.$m[1] : null;
    }

    /** Daraja's AccountReference: up to 12 letters and numbers. */
    public static function reference(?string $value): string
    {
        $clean = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', (string) $value));
        if ($clean === '') {
            $clean = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', (string) config('okjt.mpesa.reference', config('app.name')))) ?: 'PAYMENT';
        }

        return substr($clean, 0, 12);
    }

    private function recentPrompt(string $msisdn, int $amount, ?Model $payable): bool
    {
        $query = MpesaPayment::query()->where('status', MpesaPayment::PENDING)->where('created_at', '>', now()->subMinutes(2));
        $payable
            ? $query->where('payable_type', $payable->getMorphClass())->where('payable_id', $payable->getKey())
            : $query->where('phone', $msisdn)->where('amount', $amount);

        return $query->exists();
    }

    /** Daraja sends TransactionDate as 20261125103045, Nairobi time. */
    private static function transactionDate(mixed $value): ?Carbon
    {
        $value = (string) $value;

        return preg_match('/^\d{14}$/', $value) ? Carbon::createFromFormat('YmdHis', $value, 'Africa/Nairobi')->setTimezone(config('app.timezone', 'UTC')) : null;
    }

    private function inWorkspace(?int $workspaceId, callable $run): mixed
    {
        if (config('okjt.mpesa.per_workspace') && $workspaceId && CurrentWorkspace::id() !== $workspaceId) {
            $model = config('okjt.workspace.model');
            if ($model && ($workspace = $model::query()->withoutGlobalScopes()->find($workspaceId))) {
                return CurrentWorkspace::run($workspace, $run);
            }
        }

        return $run();
    }
}
