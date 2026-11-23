<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubscriberResource;
use App\Mail\NewsletterWelcome;
use App\Models\Subscriber;
use App\Traits\HandlesStandardCrud;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SubscriberController extends Controller
{
    use HandlesStandardCrud;

    protected $orderByField = 'created_at';

    protected $orderByDirection = 'desc';

    protected $resourceClass = SubscriberResource::class;

    protected function storeRules(Request $request): array
    {
        return [
            'email' => 'required|email|unique:subscribers,email',
            'name' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:100',
        ];
    }

    protected function updateRules(Request $request, $record): array
    {
        return [
            'email' => 'required|email|max:255|unique:subscribers,email,'.$record->id,
            'name' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ];
    }

    /** Where a signup may come from (the form on the site sends one of these). */
    public const SOURCES = ['insights', 'insight', 'home', 'footer', 'form', 'site-check', 'checklist'];

    /**
     * The newsletter signup. The answer is the same whether or not the address
     * was already on the list, so the form can't be used to find out who is.
     * A new or returning subscriber gets a welcome email with a one-click
     * unsubscribe link.
     */
    public function subscribe(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email|max:255',
            'name' => 'nullable|string|max:255',
            'source' => 'nullable|string|in:'.implode(',', self::SOURCES),
            'consent' => 'accepted',
        ]);

        $subscriber = Subscriber::withTrashed()->firstOrNew(['email' => strtolower($data['email'])]);
        $welcome = ! $subscriber->exists || ! $subscriber->is_active || $subscriber->trashed();
        $subscriber->fill([
            'name' => $subscriber->name ?: ($data['name'] ?? null),
            'source' => $subscriber->source ?: ($data['source'] ?? 'form'),
            'is_active' => true,
        ]);
        $subscriber->deleted_at = null;
        $subscriber->save();

        if ($welcome) {
            try {
                Mail::to($subscriber->email)->send(new NewsletterWelcome($subscriber));
            } catch (\Throwable $e) {
                Log::error('Failed to send a newsletter welcome: '.$e->getMessage());
            }
        }

        return response()->json(['message' => 'Subscribed.']);
    }

    /**
     * One-click unsubscribe from an email's signed link: a click (GET) goes back
     * to the site with a note; a mail app's own Unsubscribe button (POST,
     * RFC 8058) just gets a 200.
     */
    public function unsubscribeLink(Request $request, Subscriber $subscriber): RedirectResponse|JsonResponse
    {
        $subscriber->update(['is_active' => false]);
        if ($request->isMethod('post')) {
            return response()->json(['message' => 'Unsubscribed.']);
        }
        $origin = rtrim(config('app.frontend_url') ?: config('app.url'), '/');

        return redirect()->away($origin.'/insights?unsubscribed=1');
    }

    /**
     * Unsubscribe by email address. Always answers the same, so it can't be
     * used to find out who is on the list.
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        Subscriber::where('email', strtolower($request->email))->update(['is_active' => false]);

        return response()->json(['message' => 'If that address was subscribed, it no longer is.']);
    }
}
