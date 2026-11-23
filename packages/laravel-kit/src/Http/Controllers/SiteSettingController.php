<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Okjt\Kit\Content\SiteSettings;
use Okjt\Kit\Support\ApiResponse;

/**
 * The site settings API, for @okjt/dashboard's AdminSiteSettings, lifted from
 * okjt-app (SiteSettingController). Admin routes behind the project's own
 * admin middleware; the public one tells signed-out pages only the groups
 * listed in okjt.site_settings.public_groups:
 *
 *   Route::get('/site-settings', [SiteSettingController::class, 'publicIndex']);
 *   Route::middleware(['auth:sanctum', EnsureSuperadmin::class])->group(function () {
 *       Route::get('/admin/site-settings', [SiteSettingController::class, 'index']);
 *       Route::put('/admin/site-settings', [SiteSettingController::class, 'update']);
 *   });
 *
 * Each save goes in the console audit log, with the keys it changed (not
 * the values).
 */
class SiteSettingController extends Controller
{
    use ApiResponse;

    /** Every stored setting, for the admin screen. */
    public function index(): JsonResponse
    {
        return $this->successResponse(array_values(SiteSettings::all()));
    }

    /** Save a batch: settings: [{ key, value, type?, group? }]. */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array|max:500',
            'settings.*.key' => ['required', 'string', 'max:191', 'regex:/^[a-z0-9_.-]+$/i'],
            'settings.*.value' => 'nullable|string|max:65000',
            'settings.*.type' => 'nullable|string|max:40',
            'settings.*.group' => ['nullable', 'string', 'max:60', 'regex:/^[a-z0-9_.-]+$/i'],
        ]);

        $settings = collect($validated['settings'])->mapWithKeys(fn ($s) => [$s['key'] => [
            'value' => $s['value'] ?? null,
            'type' => $s['type'] ?? null,
            'group' => $s['group'] ?? null,
        ]])->all();
        SiteSettings::put($settings);

        config('okjt.console.audit_model')::recordAbout('settings.updated', 'site', 'Site settings', ['keys' => array_keys($settings)]);

        return $this->successResponse(array_values(SiteSettings::all()), 'Settings saved');
    }

    /** key => value for the groups declared public. Nothing else. */
    public function publicIndex(): JsonResponse
    {
        $groups = (array) config('okjt.site_settings.public_groups', []);

        return $this->successResponse(
            collect(SiteSettings::all())->whereIn('group', $groups)->map(fn ($row) => $row['value'])->all()
        );
    }
}
