<?php

namespace Okjt\Kit\Payments\Mpesa;

/**
 * Talks to M-Pesa (Daraja's M-Pesa Express), from Naoa's StkPushGateway.
 * DarajaGateway is the real one; FakeMpesaGateway stands in for tests.
 */
interface MpesaGateway
{
    /**
     * Send the "enter your PIN" prompt.
     *
     * @return array{merchant_request_id: string, checkout_request_id: string}
     *
     * @throws MpesaException when M-Pesa refuses or can't be reached
     */
    public function push(Shortcode $to, string $phone, int $amount, string $reference, string $description, string $callbackUrl): array;

    /**
     * Ask what came of a prompt (STK Query), for a callback that never came.
     *
     * @return array{pending: bool, result_code: ?string, result_desc: ?string}|null null when M-Pesa couldn't be reached
     */
    public function query(Shortcode $to, string $checkoutRequestId): ?array;
}
