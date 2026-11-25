<?php

namespace Okjt\Kit\Payments\Mpesa;

use Okjt\Kit\Switches\Switches;

/**
 * Which keys and paybill M-Pesa uses: what was saved in the admin
 * (MpesaAccount), else the server's .env (okjt.mpesa.*). A value saved in
 * the admin wins; one left blank falls back (naoa-dt).
 */
class MpesaSettings
{
    private ?MpesaAccount $appRow = null;

    private bool $loaded = false;

    /** Whether M-Pesa is switched on (the S2 switch named by okjt.mpesa.switch). */
    public function isOn(): bool
    {
        return Switches::on((string) config('okjt.mpesa.switch', 'mpesa'));
    }

    /** @return array{env: string, consumer_key: ?string, consumer_secret: ?string} */
    public function app(): array
    {
        $row = $this->appRow();

        return [
            'env' => ($row?->env ?: config('okjt.mpesa.env')) === 'production' ? 'production' : 'sandbox',
            'consumer_key' => $row?->consumer_key ?: config('okjt.mpesa.consumer_key'),
            'consumer_secret' => $row?->consumer_secret ?: config('okjt.mpesa.consumer_secret'),
        ];
    }

    public function baseUrl(): string
    {
        return $this->app()['env'] === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';
    }

    /**
     * Where a workspace's payments go. With per_workspace, only the
     * workspace's own approved paybill (never the app's, which would send a
     * vendor's money to the platform); otherwise the app's.
     */
    public function shortcode(?int $workspaceId = null): ?Shortcode
    {
        if (config('okjt.mpesa.per_workspace')) {
            $row = $workspaceId ? MpesaAccount::forWorkspace($workspaceId) : null;

            return $row && $row->approved_at && $row->shortcode && $row->passkey
                ? new Shortcode($row->shortcode, $row->passkey, $row->type ?: 'paybill', $row->till_number)
                : null;
        }

        $row = $this->appRow();
        $number = $row?->shortcode ?: config('okjt.mpesa.shortcode');
        $passkey = $row?->passkey ?: config('okjt.mpesa.passkey');
        if (! $number || ! $passkey) {
            return null;
        }

        return new Shortcode((string) $number, (string) $passkey, ($row?->type ?: config('okjt.mpesa.type')) === 'till' ? 'till' : 'paybill', $row?->till_number ?: config('okjt.mpesa.till_number'));
    }

    /** The keys are there, and so is somewhere for this workspace's money to go. */
    public function isConfigured(?int $workspaceId = null): bool
    {
        $app = $this->app();

        return filled($app['consumer_key']) && filled($app['consumer_secret']) && $this->shortcode($workspaceId) !== null;
    }

    public function callbackUrl(string $token): string
    {
        return rtrim((string) (config('okjt.mpesa.callback_base') ?: config('app.url')), '/')
            .'/'.trim((string) config('okjt.mpesa.callback_path', 'api/mpesa/callback'), '/').'/'.$token;
    }

    /** After the admin saves: read again. */
    public function refresh(): void
    {
        $this->loaded = false;
        $this->appRow = null;
    }

    private function appRow(): ?MpesaAccount
    {
        if (! $this->loaded) {
            $this->appRow = rescue(fn () => MpesaAccount::forApp(), null, false);
            $this->loaded = true;
        }

        return $this->appRow;
    }
}
