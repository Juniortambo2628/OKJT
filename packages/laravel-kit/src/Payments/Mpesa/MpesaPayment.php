<?php

namespace Okjt\Kit\Payments\Mpesa;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Okjt\Kit\Workspace\CurrentWorkspace;

/**
 * One M-Pesa prompt and what came of it. `payable` is what it pays for (an
 * order, a booking), the project's own record. Each prompt has its own
 * callback_token, part of the address M-Pesa answers to.
 *
 * status: pending → paid, cancelled (on the phone), timed_out (no answer),
 * or failed (M-Pesa's words in result_desc, or "Amount mismatch").
 */
class MpesaPayment extends Model
{
    public const PENDING = 'pending';

    public const PAID = 'paid';

    public const CANCELLED = 'cancelled';

    public const TIMED_OUT = 'timed_out';

    public const FAILED = 'failed';

    protected $table = 'okjt_mpesa_payments';

    protected $guarded = ['id'];

    protected $hidden = ['callback_token'];

    protected $casts = ['amount' => 'integer', 'paid_at' => 'datetime', 'last_queried_at' => 'datetime', 'meta' => 'array'];

    protected $attributes = ['status' => self::PENDING];

    protected static function booted(): void
    {
        static::addGlobalScope('workspace', function (Builder $query) {
            if (config('okjt.mpesa.per_workspace') && ($id = CurrentWorkspace::id())) {
                $query->where($query->getModel()->qualifyColumn('workspace_id'), $id);
            }
        });
        static::creating(function (MpesaPayment $payment) {
            if (config('okjt.mpesa.per_workspace') && empty($payment->workspace_id)) {
                $payment->workspace_id = CurrentWorkspace::id();
            }
        });
    }

    public function payable(): MorphTo
    {
        return $this->morphTo();
    }

    public function isPending(): bool
    {
        return $this->status === self::PENDING;
    }

    public function isPaid(): bool
    {
        return $this->status === self::PAID;
    }

    /** Daraja's ResultCode → a status: 0 paid, 1032 cancelled on the phone, 1037 no answer, anything else failed. */
    public static function statusFor(string $resultCode): string
    {
        return match ($resultCode) {
            '0' => self::PAID,
            '1032' => self::CANCELLED,
            '1037' => self::TIMED_OUT,
            default => self::FAILED,
        };
    }

    public function present(): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'phone' => $this->phone,
            'amount' => $this->amount,
            'result_desc' => $this->result_desc,
            'mpesa_receipt' => $this->mpesa_receipt,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
