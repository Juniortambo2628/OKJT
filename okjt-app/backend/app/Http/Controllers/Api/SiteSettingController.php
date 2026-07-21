<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SiteSettingResource;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SiteSettingController extends Controller
{
    private function clearCache()
    {
        Cache::forget('site_settings_grouped');
        Cache::forget('site_settings_maintenance');
        Cache::forget('site_settings_email');
    }

    public function index()
    {
        $settings = Cache::rememberForever('site_settings_grouped', function () {
            return SiteSetting::all()->groupBy('group');
        });

        return $settings->map(function ($group) {
            return SiteSettingResource::collection($group);
        });
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|unique:site_settings',
            'value' => 'nullable|string',
            'type' => 'string',
            'group' => 'string',
        ]);

        $setting = SiteSetting::create($validated);
        $this->clearCache();

        return new SiteSettingResource($setting);
    }

    public function show(SiteSetting $siteSetting)
    {
        return new SiteSettingResource($siteSetting);
    }

    public function update(Request $request, SiteSetting $siteSetting)
    {
        $validated = $request->validate([
            'value' => 'nullable|string',
        ]);

        $siteSetting->update($validated);
        $this->clearCache();

        return new SiteSettingResource($siteSetting);
    }

    public function destroy(SiteSetting $siteSetting)
    {
        $siteSetting->delete();
        $this->clearCache();

        return response()->json(null, 204);
    }

    public function batchUpdate(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable|string',
            'settings.*.type' => 'nullable|string',
            'settings.*.group' => 'nullable|string',
        ]);

        foreach ($request->settings as $item) {
            SiteSetting::updateOrCreate(
                ['key' => $item['key']],
                [
                    'value' => $item['value'] ?? '',
                    'type' => $item['type'] ?? 'text',
                    'group' => $item['group'] ?? 'general',
                ]
            );
        }

        $this->clearCache();

        $settings = SiteSetting::all()->groupBy('group');

        return $settings->map(function ($group) {
            return SiteSettingResource::collection($group);
        });
    }

    public function getMaintenanceSettings()
    {
        $settings = Cache::rememberForever('site_settings_maintenance', function () {
            return SiteSetting::where('group', 'maintenance')->get()->pluck('value', 'key');
        });

        return response()->json([
            'isActive' => filter_var($settings->get('maintenance_active') ?? '0', FILTER_VALIDATE_BOOLEAN),
            'title' => $settings->get('maintenance_title') ?? 'System Maintenance',
            'description' => $settings->get('maintenance_description') ?? 'OKJTech is currently undergoing scheduled maintenance.',
            'estimatedBack' => $settings->get('maintenance_estimated_back') ?? '',
        ]);
    }

    public function emailTemplates()
    {
        return SiteSettingResource::collection(
            Cache::rememberForever('site_settings_email', function () {
                return SiteSetting::where('group', 'email')->orderBy('key')->get();
            })
        );
    }

    public function showEmailTemplate(string $key)
    {
        $setting = SiteSetting::where('key', $key)->where('group', 'email')->firstOrFail();

        return new SiteSettingResource($setting);
    }

    public function storeEmailTemplate(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|unique:site_settings,key',
            'value' => 'nullable|string',
            'type' => 'nullable|string',
        ]);

        $setting = SiteSetting::updateOrCreate(
            ['key' => $validated['key']],
            [
                'value' => $validated['value'] ?? '',
                'type' => $validated['type'] ?? 'code',
                'group' => 'email',
            ]
        );

        $this->clearCache();

        return new SiteSettingResource($setting);
    }

    public function updateEmailTemplate(Request $request, string $key)
    {
        $validated = $request->validate([
            'value' => 'nullable|string',
            'type' => 'nullable|string',
        ]);

        $setting = SiteSetting::updateOrCreate(
            ['key' => $key],
            [
                'value' => $validated['value'] ?? '',
                'type' => $validated['type'] ?? 'code',
                'group' => 'email',
            ]
        );

        $this->clearCache();

        return new SiteSettingResource($setting);
    }

    public function destroyEmailTemplate(string $key)
    {
        $setting = SiteSetting::where('key', $key)->where('group', 'email')->firstOrFail();
        $setting->delete();
        $this->clearCache();

        return response()->json(null, 204);
    }
}
