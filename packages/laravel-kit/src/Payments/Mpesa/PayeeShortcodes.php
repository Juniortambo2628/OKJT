<?php

namespace Okjt\Kit\Payments\Mpesa;

/**
 * Where a payment's money goes, when a project pays more than one place:
 * Naoa's couples pay each vendor's own paybill. Mpesa::start() takes a
 * `payee` (the project's own reference, e.g. "storefront:12"), kept on the
 * payment so the reconcile command can ask the same paybill later.
 *
 * The kit's own (SettingsPayeeShortcodes) knows only the app's paybill, or
 * the workspace's with per_workspace; a project lists its own class in
 * okjt.mpesa.payees.
 */
interface PayeeShortcodes
{
    /** The paybill or till for this payee (null: the app's or the workspace's own), or null when it can't be paid now. */
    public function shortcodeFor(?string $payee, ?int $workspaceId): ?Shortcode;
}
