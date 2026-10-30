<?php

namespace Okjt\Kit\Billing;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/** The Paystack calls billing needs: start a checkout, check a payment, check the key, and webhook signatures. */
class PaystackService
{
    /**
     * Start a payment; returns the page to send the payer to.
     *
     * @param  int  $amount  smallest currency unit (cents)
     */
    public function initialize(string $email, int $amount, string $currency, string $reference, string $callbackUrl, array $metadata = []): string
    {
        $data = $this->call('post', '/transaction/initialize', [
            'email' => $email,
            'amount' => $amount,
            'currency' => $currency,
            'reference' => $reference,
            'callback_url' => $callbackUrl,
            'metadata' => $metadata,
            'channels' => Settings::get('channels', ['card', 'mobile_money']),
        ]);

        return $data['authorization_url'] ?? throw new RuntimeException('Paystack did not return a checkout page.');
    }

    /** The transaction as Paystack has it (status, amount, currency, channel, paid_at, ...). */
    public function verify(string $reference): array
    {
        return $this->call('get', '/transaction/verify/'.rawurlencode($reference));
    }

    /** Throws unless Paystack accepts the secret key (a harmless read: the latest transaction). */
    public function checkKey(): void
    {
        $this->call('get', '/transaction', ['perPage' => 1]);
    }

    /** Webhooks are signed: HMAC-SHA512 of the raw body with the secret key. */
    public function validSignature(string $payload, ?string $signature): bool
    {
        $secret = (string) Settings::paystack('secret_key');

        return $secret !== '' && $signature !== null && hash_equals(hash_hmac('sha512', $payload, $secret), $signature);
    }

    private function call(string $method, string $path, array $body = []): array
    {
        $secret = Settings::paystack('secret_key');
        if (! $secret) {
            throw new RuntimeException('Paystack is not configured (PAYSTACK_SECRET_KEY).');
        }

        $response = Http::withToken($secret)->acceptJson()->timeout(20)
            ->{$method}(rtrim((Settings::paystack('base_url') ?: 'https://api.paystack.co'), '/').$path, $body);

        if (! $response->successful() || ! $response->json('status')) {
            throw new RuntimeException('Paystack: '.($response->json('message') ?: 'request failed ('.$response->status().')'));
        }

        return (array) $response->json('data');
    }
}
