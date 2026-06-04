<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConsultationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ConsultationRequestAdminNotification;
use App\Mail\ConsultationRequestUserReceipt;

class ConsultationRequestController extends Controller
{
    public function index()
    {
        return response()->json(ConsultationRequest::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string',
        ]);

        $consultationRequest = ConsultationRequest::create($validated);

        // Send Emails
        try {
            // To Admin
            Mail::to(config('mail.from.address', 'admin@okjtech.co.ke'))
                ->send(new ConsultationRequestAdminNotification($consultationRequest));
            
            // To User
            Mail::to($consultationRequest->email)
                ->send(new ConsultationRequestUserReceipt($consultationRequest));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send consultation emails: ' . $e->getMessage());
        }

        return response()->json($consultationRequest, 201);
    }

    public function show(ConsultationRequest $consultationRequest)
    {
        return response()->json($consultationRequest);
    }

    public function update(Request $request, ConsultationRequest $consultationRequest)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,contacted,resolved,archived',
        ]);

        $consultationRequest->update($validated);

        return response()->json($consultationRequest);
    }

    public function destroy(ConsultationRequest $consultationRequest)
    {
        $consultationRequest->delete();

        return response()->json(null, 204);
    }
}
