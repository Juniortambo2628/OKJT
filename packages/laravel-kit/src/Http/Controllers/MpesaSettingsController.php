<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Validation\Rule;
use Okjt\Kit\Payments\Mpesa\DarajaGateway;
use Okjt\Kit\Payments\Mpesa\MpesaAccount;
use Okjt\Kit\Payments\Mpesa\MpesaSettings;
use Okjt\Kit\Support\ApiResponse;
use Okjt\Kit\Workspace\CurrentWorkspace;

/**
 * Connecting M-Pesa from the admin (naoa-dt's and Tena-host's
 * MpesaSettingsController), for @okjt/dashboard's AdminMpesaSettings.
 * Secrets are stored encrypted, replaced only when a new one is typed, and
 * never returned ("set" or not). Saves are audited by which fields changed,
 * never their values.
 *
 *   Route::middleware([...superadmin...])->group(function () {
 *       Route::get('/admin/mpesa', [MpesaSettingsController::class, 'show']);
 *       Route::put('/admin/mpesa', [MpesaSettingsController::class, 'update']);
 *       // okjt.mpesa.per_workspace: staff approve each workspace's own paybill
 *       Route::post('/admin/mpesa/workspaces/{workspace}/approve', [MpesaSettingsController::class, 'approve']);
 *       Route::post('/admin/mpesa/workspaces/{workspace}/revoke', [MpesaSettingsController::class, 'revoke']);
 *   });
 *   // per_workspace, for the workspace's owners:
 *   Route::get('/mpesa/shortcode', [MpesaSettingsController::class, 'workspaceShow']);
 *   Route::put('/mpesa/shortcode', [MpesaSettingsController::class, 'workspaceUpdate']);
 */
class MpesaSettingsController extends Controller
{
    use ApiResponse;

    public function __construct(private MpesaSettings $settings) {}

    public function show(): JsonResponse
    {
        $row = MpesaAccount::forApp();
        $app = $this->settings->app();

        return $this->successResponse([
            'on' => $this->settings->isOn(),
            'configured' => $this->settings->isConfigured(),
            'per_workspace' => (bool) config('okjt.mpesa.per_workspace'),
            'env' => $app['env'],
            'consumer_key' => $app['consumer_key'],
            'consumer_secret_set' => filled($app['consumer_secret']),
            'shortcode' => $row?->shortcode ?: config('okjt.mpesa.shortcode'),
            'type' => ($row?->type ?: config('okjt.mpesa.type')) === 'till' ? 'till' : 'paybill',
            'till_number' => $row?->till_number ?: config('okjt.mpesa.till_number'),
            'passkey_set' => filled($row?->passkey ?: config('okjt.mpesa.passkey')),
            'from_admin' => (bool) $row,
            'callback_url' => $this->settings->callbackUrl('…'),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'env' => ['required', Rule::in(['sandbox', 'production'])],
            'consumer_key' => 'nullable|string|max:255',
            'consumer_secret' => 'nullable|string|max:255',
            'shortcode' => 'nullable|digits_between:5,7',
            'type' => ['required', Rule::in(['paybill', 'till'])],
            'till_number' => 'nullable|digits_between:5,8|required_if:type,till',
            'passkey' => 'nullable|string|max:255',
        ]);
        $row = MpesaAccount::forApp() ?? new MpesaAccount;
        $before = MpesaAccount::forApp()?->consumer_key;
        $changed = $this->apply($row, $validated, ['env', 'consumer_key', 'shortcode', 'type', 'till_number'], ['consumer_secret', 'passkey']);
        if ($before) {
            DarajaGateway::forgetToken($before);
        }
        $this->settings->refresh();
        if ($changed) {
            config('okjt.console.audit_model')::recordAbout('mpesa.settings_updated', 'site', 'M-Pesa settings', ['fields' => $changed]);
        }

        return $this->successResponse($this->show()->getData(true)['data'], 'M-Pesa settings saved');
    }

    /** The current workspace's own paybill (per_workspace), without its passkey. */
    public function workspaceShow(): JsonResponse
    {
        $row = $this->workspaceRow();

        return $this->successResponse($this->presentWorkspace($row));
    }

    /** The workspace gives its paybill or till and passkey; it waits for staff approval again. */
    public function workspaceUpdate(Request $request): JsonResponse
    {
        abort_unless(config('okjt.mpesa.per_workspace') && CurrentWorkspace::id(), 404);
        $validated = $request->validate([
            'shortcode' => 'required|digits_between:5,7',
            'type' => ['required', Rule::in(['paybill', 'till'])],
            'till_number' => 'nullable|digits_between:5,8|required_if:type,till',
            'passkey' => 'nullable|string|max:255',
        ]);
        $row = $this->workspaceRow() ?? new MpesaAccount(['workspace_id' => CurrentWorkspace::id()]);
        abort_if(! $row->passkey && blank($validated['passkey'] ?? null), 422, 'Give the passkey for this paybill or till.');
        $this->apply($row, $validated + ['approved_at' => null], ['shortcode', 'type', 'till_number', 'approved_at'], ['passkey']);

        return $this->successResponse($this->presentWorkspace($row->fresh()), 'Saved. It will be used once it has been approved.');
    }

    public function approve(string $workspace): JsonResponse
    {
        $row = MpesaAccount::forWorkspace((int) $workspace);
        abort_unless($row && $row->shortcode && $row->passkey, 422, "That workspace hasn't given a paybill and passkey yet.");
        $row->update(['approved_at' => now()]);
        config('okjt.console.audit_model')::recordAbout('mpesa.workspace_approved', 'workspace', '#'.$workspace);

        return $this->successResponse($this->presentWorkspace($row), 'Approved');
    }

    public function revoke(string $workspace): JsonResponse
    {
        $row = MpesaAccount::forWorkspace((int) $workspace);
        abort_unless($row, 404);
        $row->update(['approved_at' => null]);
        config('okjt.console.audit_model')::recordAbout('mpesa.workspace_revoked', 'workspace', '#'.$workspace);

        return $this->successResponse($this->presentWorkspace($row), 'Approval withdrawn');
    }

    /** Set plain fields as given and secrets only when typed; returns the names of what changed. */
    private function apply(MpesaAccount $row, array $values, array $plain, array $secrets): array
    {
        foreach ($plain as $field) {
            if (array_key_exists($field, $values)) {
                $row->{$field} = $values[$field];
            }
        }
        foreach ($secrets as $field) {
            if (filled($values[$field] ?? null)) {
                $row->{$field} = $values[$field];
            }
        }
        $changed = array_values(array_diff(array_keys($row->getDirty()), ['approved_at']));
        $row->save();

        return $changed;
    }

    private function workspaceRow(): ?MpesaAccount
    {
        return CurrentWorkspace::id() ? MpesaAccount::forWorkspace(CurrentWorkspace::id()) : null;
    }

    private function presentWorkspace(?MpesaAccount $row): array
    {
        return [
            'shortcode' => $row?->shortcode,
            'type' => $row?->type ?: 'paybill',
            'till_number' => $row?->till_number,
            'passkey_set' => filled($row?->passkey),
            'approved' => (bool) $row?->approved_at,
            'approved_at' => $row?->approved_at?->toIso8601String(),
        ];
    }
}
