<?php

namespace Okjt\Kit\Payments\Mpesa;

/**
 * M-Pesa for tests: remembers each prompt, answers queries with what a test
 * set, and can be told to refuse.
 *
 *   $this->app->instance(MpesaGateway::class, $fake = new FakeMpesaGateway);
 */
class FakeMpesaGateway implements MpesaGateway
{
    /** @var list<array{to: Shortcode, phone: string, amount: int, reference: string, description: string, callback_url: string, checkout_request_id: string}> */
    public array $pushes = [];

    /** @var array<string, array|null> checkout id => query answer */
    public array $answers = [];

    public ?string $refuse = null;

    public function push(Shortcode $to, string $phone, int $amount, string $reference, string $description, string $callbackUrl): array
    {
        if ($this->refuse !== null) {
            throw new MpesaException($this->refuse, 502);
        }
        $n = count($this->pushes) + 1;
        $ids = ['merchant_request_id' => "fake-merchant-{$n}", 'checkout_request_id' => "ws_CO_fake_{$n}"];
        $this->pushes[] = compact('to', 'phone', 'amount', 'reference', 'description') + ['callback_url' => $callbackUrl, 'checkout_request_id' => $ids['checkout_request_id']];

        return $ids;
    }

    public function query(Shortcode $to, string $checkoutRequestId): ?array
    {
        return array_key_exists($checkoutRequestId, $this->answers)
            ? $this->answers[$checkoutRequestId]
            : ['pending' => true, 'result_code' => null, 'result_desc' => null];
    }

    /** A Daraja callback body for the last prompt (or a given checkout id). */
    public function callbackBody(int $resultCode = 0, ?int $amount = null, string $receipt = 'TKA1B2C3D4', ?string $checkoutId = null): array
    {
        $last = end($this->pushes) ?: [];
        $result = [
            'MerchantRequestID' => 'fake',
            'CheckoutRequestID' => $checkoutId ?? ($last['checkout_request_id'] ?? ''),
            'ResultCode' => $resultCode,
            'ResultDesc' => $resultCode === 0 ? 'The service request is processed successfully.' : 'Request cancelled by user',
        ];
        if ($resultCode === 0) {
            $result['CallbackMetadata'] = ['Item' => [
                ['Name' => 'Amount', 'Value' => $amount ?? ($last['amount'] ?? 0)],
                ['Name' => 'MpesaReceiptNumber', 'Value' => $receipt],
                ['Name' => 'TransactionDate', 'Value' => 20261125103045],
                ['Name' => 'PhoneNumber', 'Value' => (int) ($last['phone'] ?? 0)],
            ]];
        }

        return ['Body' => ['stkCallback' => $result]];
    }
}
