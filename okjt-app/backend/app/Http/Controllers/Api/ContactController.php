<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactSubmissionReceived;
use App\Mail\NewSubmissionNotification;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'country_code' => 'nullable|string|max:10',
            'phone_number' => 'nullable|string|max:50',
            'contact_method' => 'required|in:email,whatsapp',
            'online_consultation' => 'boolean',
            'consultation_date' => 'nullable|date|after_or_equal:today',
            'consultation_time' => 'nullable|date_format:H:i',
            'message' => 'required|string',
            'consent' => 'required|accepted',
        ]);

        $validated['ip_address'] = $request->ip();
        $validated['consent'] = true;

        $submission = ContactSubmission::create($validated);

        // Create notification
        Notification::createSubmissionNotification($submission);

        // Send confirmation email to user (best-effort)
        try {
            Mail::to($submission->email)->send(new ContactSubmissionReceived($submission));
        } catch (\Throwable $e) {
            \Log::warning('Failed to send contact confirmation email: '.$e->getMessage());
        }

        // Send notification email to admin (best-effort)
        try {
            $adminAddress = config('mail.from.address');
            Mail::to($adminAddress)->send(new NewSubmissionNotification($submission));
        } catch (\Throwable $e) {
            \Log::warning('Failed to send admin submission notification email: '.$e->getMessage());
        }

        return response()->json([
            'success' => true,
            'data' => ['id' => $submission->id],
            'message' => 'Thank you! Your message has been sent successfully.',
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $query = ContactSubmission::orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        $submissions = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $submissions,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $submission = ContactSubmission::find($id);

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $submission,
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $submission = ContactSubmission::find($id);

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found',
            ], 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,accepted,postponed,cancelled,completed',
            'admin_message' => 'nullable|string',
        ]);

        $submission->update([
            'status' => $validated['status'],
            'admin_message' => $validated['admin_message'] ?? null,
            'status_updated_at' => now(),
            'updated_by' => $request->user()?->name ?? 'admin',
        ]);

        return response()->json([
            'success' => true,
            'data' => $submission,
            'message' => 'Status updated successfully',
        ]);
    }

    public function availableTimes(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date|after_or_equal:today',
        ]);

        $allTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
        $bookedTimes = ContactSubmission::getBookedTimesForDate($request->date);

        $availableTimes = array_diff($allTimes, $bookedTimes);

        return response()->json([
            'success' => true,
            'data' => array_values($availableTimes),
        ]);
    }

    public function upcomingAppointments(Request $request): JsonResponse
    {
        try {
            $days = (int) $request->get('days', 7);
            $appointments = ContactSubmission::upcoming($days)
                ->orderBy('consultation_date')
                ->orderBy('consultation_time')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $appointments,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching upcoming appointments: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch upcoming appointments',
                'data' => [],
            ], 500);
        }
    }

    /**
     * Get recent submissions
     */
    public function recent(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 5);
        $submissions = ContactSubmission::orderBy('created_at', 'desc')
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $submissions,
        ]);
    }

    /**
     * Delete submission
     */
    public function destroy(int $id): JsonResponse
    {
        $submission = ContactSubmission::find($id);

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found',
            ], 404);
        }

        $submission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Submission deleted successfully',
        ]);
    }
}

