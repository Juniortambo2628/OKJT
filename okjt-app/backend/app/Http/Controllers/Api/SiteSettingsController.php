<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SiteSettingsController extends Controller
{
    /**
     * Get all site settings (public)
     */
    public function publicIndex()
    {
        $settings = SiteSetting::getAllAsArray();

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Get all site settings (admin)
     */
    public function index()
    {
        $settings = SiteSetting::all();

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'site_name' => 'nullable|string|max:255',
            'site_description' => 'nullable|string|max:1000',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'social_twitter' => 'nullable|url|max:500',
            'social_linkedin' => 'nullable|url|max:500',
            'social_github' => 'nullable|url|max:500',
        ]);

        foreach ($validated as $key => $value) {
            SiteSetting::set($key, $value, 'string');
        }

        return response()->json([
            'success' => true,
            'data' => SiteSetting::getAllAsArray(),
            'message' => 'Settings updated successfully',
        ]);
    }

    /**
     * Upload portfolio file
     */
    public function uploadPortfolio(Request $request)
    {
        $request->validate([
            'portfolio' => 'required|file|mimes:pdf,doc,docx|max:102400', // 100MB
        ]);

        $file = $request->file('file');
        $path = $file->store('portfolio', 'public');
        $url = Storage::disk('public')->url($path);

        SiteSetting::set('portfolio_file_url', $url, 'file');

        return response()->json([
            'success' => true,
            'data' => ['portfolio_file_url' => $url],
            'message' => 'Portfolio file uploaded successfully',
        ]);
    }

    /**
     * Delete portfolio file
     */
    public function deletePortfolio()
    {
        $currentUrl = SiteSetting::get('portfolio_file_url');
        
        if ($currentUrl) {
            // Extract path from URL and delete
            $path = str_replace('/storage/', '', parse_url($currentUrl, PHP_URL_PATH));
            Storage::disk('public')->delete($path);
        }

        SiteSetting::set('portfolio_file_url', null, 'file');

        return response()->json([
            'success' => true,
            'message' => 'Portfolio file deleted successfully',
        ]);
    }

    /**
     * Upload profile avatar
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:5120', // 5MB
        ]);

        $file = $request->file('avatar');
        $path = $file->store('avatars', 'public');
        $url = Storage::disk('public')->url($path);

        // Delete old avatar if exists
        $oldUrl = SiteSetting::get('avatar_url');
        if ($oldUrl) {
            $oldPath = str_replace('/storage/', '', parse_url($oldUrl, PHP_URL_PATH));
            Storage::disk('public')->delete($oldPath);
        }

        SiteSetting::set('avatar_url', $url, 'file');

        return response()->json([
            'success' => true,
            'data' => ['avatar_url' => $url],
            'message' => 'Profile picture updated successfully',
        ]);
    }
}
