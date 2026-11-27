<?php

namespace Okjt\Kit\Payments\Mpesa;

/**
 * The kit's PayeeShortcodes: no payee means the paybill in the M-Pesa
 * settings (the app's, or the workspace's own with per_workspace). A named
 * payee it can't know, so it refuses rather than send someone else's money
 * to the app's paybill.
 */
class SettingsPayeeShortcodes implements PayeeShortcodes
{
    public function __construct(private MpesaSettings $settings) {}

    public function shortcodeFor(?string $payee, ?int $workspaceId): ?Shortcode
    {
        return $payee === null ? $this->settings->shortcode($workspaceId) : null;
    }
}
