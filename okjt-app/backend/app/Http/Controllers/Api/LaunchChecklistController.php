<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\LaunchChecklistMail;
use App\Models\Subscriber;
use App\Support\LaunchChecklist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/** The launch checklist: read it, or have it emailed (and subscribe, when asked). */
class LaunchChecklistController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(['data' => LaunchChecklist::sections()])
            ->header('Cache-Control', 'public, max-age=3600');
    }

    public function email(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => 'required|email|max:255', 'subscribe' => 'boolean']);

        if ($data['subscribe'] ?? false) {
            $subscriber = Subscriber::withTrashed()->firstOrNew(['email' => strtolower($data['email'])]);
            $subscriber->fill(['source' => $subscriber->source ?: 'checklist', 'is_active' => true]);
            $subscriber->deleted_at = null;
            $subscriber->save();
        }

        try {
            Mail::to($data['email'])->send(new LaunchChecklistMail);
        } catch (\Throwable $e) {
            Log::error('Failed to send the launch checklist: '.$e->getMessage());

            return response()->json(['message' => 'The email could not be sent. Please try again in a minute.'], 502);
        }

        return response()->json(['message' => 'Sent.']);
    }
}
