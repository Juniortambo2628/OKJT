<?php

namespace Okjt\Kit\Payments\Mpesa;

use Illuminate\Foundation\Events\Dispatchable;

/**
 * A prompt's outcome is known (paid, cancelled, timed out or failed), sent
 * once per payment, after it is saved, inside its workspace. A project
 * listens to apply it to what was paid for:
 *
 *   Event::listen(function (MpesaPaymentSettled $e) {
 *       if ($e->payment->isPaid() && $e->payment->payable instanceof Order) { ... }
 *   });
 */
class MpesaPaymentSettled
{
    use Dispatchable;

    public function __construct(public MpesaPayment $payment) {}
}
