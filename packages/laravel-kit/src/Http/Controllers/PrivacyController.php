<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Okjt\Kit\Content\SiteSettings;
use Okjt\Kit\Privacy\ErasureRequest;
use Okjt\Kit\Privacy\ErasureRequested;
use Okjt\Kit\Privacy\Privacy;
use Okjt\Kit\Support\ApiResponse;

/**
 * Privacy, from Naoa (PrivacyController): the retention schedule, and
 * requests from people to delete their data, for @okjt/site's
 * ErasureRequestForm and @okjt/dashboard's AdminPrivacy:
 *
 *   Route::post('/erasure-requests', [PrivacyController::class, 'request'])->middleware('throttle:5,60');
 *   Route::middleware([...admin...])->group(function () {
 *       Route::get('/admin/privacy', [PrivacyController::class, 'index']);
 *       Route::post('/admin/privacy/erasure-requests', [PrivacyController::class, 'store']);
 *       Route::post('/admin/privacy/erasure-requests/{id}/complete', [PrivacyController::class, 'complete']);
 *   });
 *
 * Erasing and declining are in the audit log, with the request's number
 * only (not the person's details).
 */
class PrivacyController extends Controller
{
    use ApiResponse;

    public function __construct(private Privacy $privacy) {}

    /** Someone asks, from the site, for their data to be deleted. */
    public function request(Request $request): JsonResponse
    {
        if (filled($request->input(config('okjt.privacy.honeypot', 'website')))) {
            return $this->createdResponse(['received' => true], $this->thanks());
        }

        $erasure = ErasureRequest::create($request->validate([
            'name' => 'required|string|max:120',
            'email' => 'nullable|email|max:191|required_without:phone',
            'phone' => 'nullable|string|max:50|required_without:email',
            'details' => 'nullable|string|max:2000',
        ]));

        $to = config('okjt.privacy.notify_email') ?: SiteSettings::get('contact_email');
        if ($to) {
            try {
                $notification = config('okjt.privacy.received_notification', ErasureRequested::class);
                Notification::route('mail', $to)->notify(new $notification($erasure));
            } catch (\Throwable $e) {
                Log::error('Erasure request saved, but the email to the team failed', ['id' => $erasure->id, 'error' => get_class($e)]);
            }
        }

        return $this->createdResponse(['received' => true, 'due_at' => $erasure->due_at->toDateString()], $this->thanks());
    }

    /** The schedule, and every request (open ones first, then the latest). */
    public function index(): JsonResponse
    {
        return $this->successResponse([
            'retention' => $this->privacy->schedule(),
            'erasure_days' => (int) config('okjt.privacy.erasure_days', 14),
            'auto_complete' => (bool) config('okjt.privacy.auto_complete'),
            'requests' => ErasureRequest::query()
                ->orderByRaw('case when status = ? then 0 else 1 end', [ErasureRequest::RECEIVED])
                ->orderBy('due_at')->latest('id')->limit(200)->get()->map->present()->values(),
        ]);
    }

    /** The team records a request that came another way (a call, a message). */
    public function store(Request $request): JsonResponse
    {
        $erasure = ErasureRequest::create($request->validate([
            'name' => 'required|string|max:120',
            'email' => 'nullable|email|max:191',
            'phone' => 'nullable|string|max:50',
            'subject_id' => 'nullable|string|max:64',
            'details' => 'nullable|string|max:2000',
        ]));

        return $this->createdResponse($erasure->present(), 'Request recorded');
    }

    /** Erase now, or decline with a reason the person will be given. */
    public function complete(Request $request, string $id): JsonResponse
    {
        $erasure = ErasureRequest::findOrFail($id);
        abort_unless($erasure->isOpen(), 422, 'This request has already been dealt with.');
        $validated = $request->validate([
            'action' => ['required', Rule::in(['erase', 'decline'])],
            'subject_id' => 'nullable|string|max:64',
            'outcome' => 'nullable|string|max:1000|required_if:action,decline',
        ]);
        $by = $request->user()?->getKey();
        $audit = config('okjt.console.audit_model');

        if ($validated['action'] === 'erase') {
            if (! empty($validated['subject_id'])) {
                $erasure->subject_id = $validated['subject_id'];
            }
            $this->privacy->erase($erasure, $by, $validated['outcome'] ?? null);
            $audit::recordAbout('privacy.erased', 'erasure_request', '#'.$erasure->id);
            $message = 'Their data was deleted';
        } else {
            $this->privacy->decline($erasure, $validated['outcome'], $by);
            $audit::recordAbout('privacy.declined', 'erasure_request', '#'.$erasure->id);
            $message = 'Request declined';
        }

        return $this->successResponse($erasure->fresh()->present(), $message);
    }

    private function thanks(): string
    {
        $days = (int) config('okjt.privacy.erasure_days', 14);

        return config('okjt.privacy.thanks') ?: "We've received your request and will deal with it within {$days} days.";
    }
}
