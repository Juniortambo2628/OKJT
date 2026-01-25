<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrustedClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TrustedClientController extends Controller
{
    /**
     * Get all active trusted clients (public)
     */
    public function publicIndex()
    {
        $clients = TrustedClient::active()->ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $clients,
        ]);
    }

    /**
     * Get all trusted clients (admin)
     */
    public function index()
    {
        $clients = TrustedClient::ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $clients,
        ]);
    }

    /**
     * Store a new trusted client
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'website_url' => 'nullable|url|max:500',
            'is_active' => 'boolean',
        ]);

        $validated['sort_order'] = TrustedClient::max('sort_order') + 1;

        $client = TrustedClient::create($validated);

        return response()->json([
            'success' => true,
            'data' => $client,
            'message' => 'Trusted client created successfully',
        ], 201);
    }

    /**
     * Update a trusted client
     */
    public function update(Request $request, int $id)
    {
        $client = TrustedClient::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'website_url' => 'nullable|url|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $client->update($validated);

        return response()->json([
            'success' => true,
            'data' => $client->fresh(),
            'message' => 'Trusted client updated successfully',
        ]);
    }

    /**
     * Delete a trusted client
     */
    public function destroy(int $id)
    {
        $client = TrustedClient::findOrFail($id);
        
        // Delete associated media
        $client->clearMediaCollection('logo');
        $client->delete();

        return response()->json([
            'success' => true,
            'message' => 'Trusted client deleted successfully',
        ]);
    }

    /**
     * Upload logo for a trusted client
     */
    public function uploadLogo(Request $request, int $id)
    {
        $client = TrustedClient::findOrFail($id);

        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        $file = $request->file('logo');
        $path = $file->store('trusted-clients', 'public');
        $url = Storage::disk('public')->url($path);

        // Delete old logo if exists
        if ($client->logo_url) {
            $oldPath = str_replace('/storage/', '', parse_url($client->logo_url, PHP_URL_PATH));
            Storage::disk('public')->delete($oldPath);
        }

        $client->update(['logo_url' => $url]);

        return response()->json([
            'success' => true,
            'data' => $client->fresh(),
            'message' => 'Logo uploaded successfully',
        ]);
    }

    /**
     * Reorder trusted clients
     */
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:trusted_clients,id',
        ]);

        foreach ($validated['ids'] as $index => $id) {
            TrustedClient::where('id', $id)->update(['sort_order' => $index]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order updated successfully',
        ]);
    }
}
