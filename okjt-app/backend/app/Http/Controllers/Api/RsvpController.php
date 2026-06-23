<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RsvpResource;
use App\Models\Rsvp;
use Illuminate\Http\Request;
use App\Mail\RsvpConfirmation;
use Illuminate\Support\Facades\Mail;

class RsvpController extends Controller
{
    public function index()
    {
        return RsvpResource::collection(Rsvp::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:rsvps,email',
            'company' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'sector' => 'nullable|string|max:255',
            'interest' => 'nullable|string|max:255',
            'consent' => 'boolean',
            'newsletter' => 'boolean',
            'attendance' => 'nullable|string|max:255',
            'type' => 'nullable|string|in:rsvp,early_access',
        ]);

        $rsvp = Rsvp::create($validated);

        try {
            Mail::to($rsvp->email)->queue(new RsvpConfirmation($rsvp));
        } catch (\Exception $e) {
            logger()->error("Failed to send RSVP confirmation mail: " . $e->getMessage());
        }

        return new RsvpResource($rsvp);
    }

    public function show(Rsvp $rsvp)
    {
        return new RsvpResource($rsvp);
    }

    public function update(Request $request, Rsvp $rsvp)
    {
        $validated = $request->validate([
            'attendance' => 'nullable|string|max:255',
            'type' => 'nullable|string|in:rsvp,early_access',
        ]);

        $rsvp->update($validated);

        return new RsvpResource($rsvp);
    }

    public function destroy(Rsvp $rsvp)
    {
        $rsvp->delete();
        return response()->json(null, 204);
    }
}
