<?php

namespace Okjt\Kit\Billing;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One payment for an account's plan: its receipt once paid. Amounts are in the smallest unit (cents). */
class Payment extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_SUCCESS = 'success';

    public const STATUS_FAILED = 'failed';

    protected $table = 'payments';

    protected $fillable = ['account_id', 'user_id', 'reference', 'plan', 'amount', 'currency', 'status', 'channel', 'paid_at', 'gateway_response'];

    protected function casts(): array
    {
        return ['paid_at' => 'datetime', 'gateway_response' => 'array', 'amount' => 'integer'];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(config('okjt.accounts.model'), 'account_id');
    }

    /** As the billing page lists it (no gateway internals). */
    public function receipt(): array
    {
        return [
            'reference' => $this->reference,
            'plan' => $this->plan,
            'plan_name' => Plans::get($this->plan)['name'] ?? $this->plan,
            'amount' => $this->amount / 100,
            'currency' => $this->currency,
            'status' => $this->status,
            'channel' => $this->channel,
            'paid_at' => $this->paid_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
