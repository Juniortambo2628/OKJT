<?php

namespace Okjt\Kit\Payments\Mpesa;

use Illuminate\Database\Eloquent\Model;

/**
 * M-Pesa settings saved in the admin (naoa-dt's integration credentials,
 * Tena-host's settings). The row with no workspace is the app's: the Daraja
 * keys and, normally, the paybill or till. With okjt.mpesa.per_workspace,
 * each workspace has a row of its own with its own paybill or till (Naoa's
 * vendors), usable once staff approve it. Secrets are encrypted and never
 * leave the server.
 */
class MpesaAccount extends Model
{
    protected $table = 'okjt_mpesa_accounts';

    protected $fillable = ['workspace_id', 'env', 'consumer_key', 'consumer_secret', 'shortcode', 'type', 'till_number', 'passkey', 'approved_at'];

    protected $hidden = ['consumer_secret', 'passkey'];

    protected $casts = ['consumer_secret' => 'encrypted', 'passkey' => 'encrypted', 'approved_at' => 'datetime'];

    public static function forApp(): ?self
    {
        return static::query()->whereNull('workspace_id')->first();
    }

    public static function forWorkspace(int $workspaceId): ?self
    {
        return static::query()->where('workspace_id', $workspaceId)->first();
    }
}
