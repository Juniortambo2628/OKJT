<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Okjt\Kit\Content\ContactMessage;
use Okjt\Kit\Content\ContactMessageReceived;
use Okjt\Kit\Content\ContactReply;
use Okjt\Kit\Content\SiteSettings;
use Okjt\Kit\Support\ApiResponse;

/**
 * The contact form and its inbox, from Naoa (EnquiryController) and
 * Tena-host (ContactController). For @okjt/site's ContactForm and
 * @okjt/dashboard's AdminContactMessages:
 *
 *   Route::post('/contact', [ContactMessageController::class, 'store'])->middleware('throttle:5,5');
 *   Route::middleware([...admin...])->group(function () {
 *       Route::get('/admin/contact-messages', [ContactMessageController::class, 'index']);
 *       Route::get('/admin/contact-messages/{id}', [ContactMessageController::class, 'show']);
 *       Route::post('/admin/contact-messages/{id}/reply', [ContactMessageController::class, 'reply']);
 *       Route::patch('/admin/contact-messages/{id}', [ContactMessageController::class, 'update']);
 *       Route::delete('/admin/contact-messages/{id}', [ContactMessageController::class, 'destroy']);
 *   });
 */
class ContactMessageController extends Controller
{
    use ApiResponse;

    /** A visitor's message: saved, then the team is told (a failed email never loses the message). */
    public function store(Request $request): JsonResponse
    {
        // The hidden field people don't see; a bot that fills it gets the same answer and nothing is kept.
        if (filled($request->input(config('okjt.contact.honeypot', 'website')))) {
            return $this->createdResponse(null, $this->thanks());
        }

        $topics = (array) config('okjt.contact.topics', []);
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150',
            'topic' => ['nullable', 'string', $topics ? Rule::in($topics) : 'max:60'],
            'subject' => 'nullable|string|max:150',
            'message' => 'required|string|max:4000',
        ]);

        $contact = ContactMessage::create($validated + ['status' => 'new']);

        $to = config('okjt.contact.notify_email') ?: SiteSettings::get('contact_email');
        if ($to) {
            try {
                $notification = config('okjt.contact.received_notification', ContactMessageReceived::class);
                Notification::route('mail', $to)->notify(new $notification($contact));
            } catch (\Throwable $e) {
                Log::error('Contact message saved, but the email to the team failed', ['id' => $contact->id, 'error' => get_class($e)]);
            }
        }

        return $this->createdResponse(null, $this->thanks());
    }

    /** The inbox: newest first, ?status=new|read|replied|archived, ?search=, 25 a page, with counts. */
    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::query()->latest()->latest('id');
        if (in_array($request->query('status'), ContactMessage::STATUSES, true)) {
            $query->where('status', $request->query('status'));
        }
        if ($search = trim((string) $request->query('search'))) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")->orWhere('subject', 'like', "%{$search}%"));
        }
        $page = $query->paginate(25);

        return $this->successResponse([
            'data' => collect($page->items())->map->present()->values(),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()],
            'counts' => ContactMessage::query()->selectRaw('status, count(*) as n')->groupBy('status')->pluck('n', 'status'),
        ]);
    }

    /** One message; opening a new one marks it read. */
    public function show(string $id): JsonResponse
    {
        $contact = ContactMessage::findOrFail($id);
        if ($contact->status === 'new') {
            $contact->update(['status' => 'read']);
        }

        return $this->successResponse($contact->present());
    }

    /** Reply by email; marked replied only if the email went. */
    public function reply(Request $request, string $id): JsonResponse
    {
        $contact = ContactMessage::findOrFail($id);
        $validated = $request->validate(['message' => 'required|string|max:10000']);

        try {
            $notification = config('okjt.contact.reply_notification', ContactReply::class);
            Notification::route('mail', $contact->email)->notify(new $notification($contact, $validated['message']));
        } catch (\Throwable $e) {
            Log::error('Contact reply email failed', ['id' => $contact->id, 'error' => get_class($e)]);

            return $this->errorResponse("The reply couldn't be sent. Nothing was marked as replied.", 502);
        }

        $contact->update(['reply_message' => $validated['message'], 'replied_at' => now(), 'replied_by' => $request->user()?->getKey(), 'status' => 'replied']);

        return $this->successResponse($contact->present(), 'Reply sent');
    }

    /** Change the status (archive, or back to read). */
    public function update(Request $request, string $id): JsonResponse
    {
        $contact = ContactMessage::findOrFail($id);
        $validated = $request->validate(['status' => ['required', Rule::in(ContactMessage::STATUSES)]]);
        $contact->update($validated);

        return $this->successResponse($contact->present(), $validated['status'] === 'archived' ? 'Archived' : 'Saved');
    }

    public function destroy(string $id): JsonResponse
    {
        ContactMessage::findOrFail($id)->delete();

        return $this->successResponse(null, 'Message deleted');
    }

    private function thanks(): string
    {
        return config('okjt.contact.thanks', "Thanks, we'll get back to you shortly.");
    }
}
