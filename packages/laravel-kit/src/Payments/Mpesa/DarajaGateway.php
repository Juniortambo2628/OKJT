<?php

namespace Okjt\Kit\Payments\Mpesa;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Safaricom Daraja's M-Pesa Express (STK Push and STK Query), from Naoa and
 * naoa-dt. The sign-in token is cached until shortly before it expires and
 * fetched under a lock, so a rush of payments asks for one token, not one
 * each (naoa-dt). Calls time out quickly (okjt.mpesa.http_timeout) so a slow
 * Daraja can't tie up the server.
 */
class DarajaGateway implements MpesaGateway
{
    public function __construct(private MpesaSettings $settings) {}

    public function push(Shortcode $to, string $phone, int $amount, string $reference, string $description, string $callbackUrl): array
    {
        [$timestamp, $password] = $this->password($to);
        try {
            $response = $this->http()->post($this->url('/mpesa/stkpush/v1/processrequest'), [
                'BusinessShortCode' => $to->number,
                'Password' => $password,
                'Timestamp' => $timestamp,
                'TransactionType' => $to->isTill() ? 'CustomerBuyGoodsOnline' : 'CustomerPayBillOnline',
                'Amount' => $amount,
                'PartyA' => $phone,
                'PartyB' => $to->receiver(),
                'PhoneNumber' => $phone,
                'CallBackURL' => $callbackUrl,
                'AccountReference' => $reference,
                'TransactionDesc' => mb_substr($description, 0, 13),
            ]);
        } catch (MpesaException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::warning('M-Pesa prompt: Daraja unreachable', ['error' => get_class($e)]);
            throw new MpesaException("Couldn't reach M-Pesa. Please try again in a moment.", 502);
        }

        if (! $response->successful() || (string) $response->json('ResponseCode') !== '0' || ! $response->json('CheckoutRequestID')) {
            Log::warning('M-Pesa prompt refused', ['status' => $response->status(), 'code' => $response->json('errorCode') ?? $response->json('ResponseCode')]);
            throw new MpesaException("M-Pesa couldn't send the prompt. Check the phone number and try again.", 502);
        }

        return [
            'merchant_request_id' => (string) $response->json('MerchantRequestID'),
            'checkout_request_id' => (string) $response->json('CheckoutRequestID'),
        ];
    }

    public function query(Shortcode $to, string $checkoutRequestId): ?array
    {
        [$timestamp, $password] = $this->password($to);
        try {
            $body = $this->http()->post($this->url('/mpesa/stkpushquery/v1/query'), [
                'BusinessShortCode' => $to->number,
                'Password' => $password,
                'Timestamp' => $timestamp,
                'CheckoutRequestID' => $checkoutRequestId,
            ])->json() ?? [];
        } catch (\Throwable) {
            return null;
        }

        // Daraja's "still waiting for the customer".
        if (($body['errorCode'] ?? null) === '500.001.1001') {
            return ['pending' => true, 'result_code' => null, 'result_desc' => null];
        }
        if (! array_key_exists('ResultCode', $body)) {
            return null;
        }

        return ['pending' => false, 'result_code' => (string) $body['ResultCode'], 'result_desc' => $body['ResultDesc'] ?? null];
    }

    /** Forget the cached sign-in, e.g. after the keys change. */
    public static function forgetToken(string $consumerKey): void
    {
        Cache::forget(self::tokenKey($consumerKey));
    }

    private static function tokenKey(string $consumerKey): string
    {
        return 'okjt:mpesa:token:'.md5($consumerKey);
    }

    private function token(): string
    {
        $app = $this->settings->app();
        $key = self::tokenKey((string) $app['consumer_key']);
        if ($cached = Cache::get($key)) {
            return $cached;
        }

        return Cache::lock($key.':lock', 15)->block(10, function () use ($app, $key) {
            if ($cached = Cache::get($key)) {
                return $cached;
            }
            $response = Http::timeout($this->timeout())->withBasicAuth((string) $app['consumer_key'], (string) $app['consumer_secret'])
                ->acceptJson()->get($this->url('/oauth/v1/generate'), ['grant_type' => 'client_credentials']);
            $token = $response->json('access_token');
            if (! $response->successful() || ! $token) {
                Log::error('M-Pesa sign-in failed', ['status' => $response->status()]);
                throw new MpesaException("Couldn't sign in to M-Pesa. Check the keys in the M-Pesa settings.", 502);
            }
            Cache::put($key, $token, max(60, (int) $response->json('expires_in', 3599) - 120));

            return $token;
        });
    }

    private function http(): \Illuminate\Http\Client\PendingRequest
    {
        return Http::timeout($this->timeout())->acceptJson()->withToken($this->token());
    }

    /** @return array{0: string, 1: string} */
    private function password(Shortcode $to): array
    {
        $timestamp = now('Africa/Nairobi')->format('YmdHis');

        return [$timestamp, base64_encode($to->number.$to->passkey.$timestamp)];
    }

    private function url(string $path): string
    {
        return $this->settings->baseUrl().$path;
    }

    private function timeout(): int
    {
        return (int) config('okjt.mpesa.http_timeout', 20);
    }
}
