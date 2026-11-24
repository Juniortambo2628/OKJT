<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Collection;
use Okjt\Kit\Notifications\Notification;
use Okjt\Kit\Support\ApiResponse;

/**
 * The dashboard's bell: the current workspace's latest notifications, and
 * marking them all read.
 *
 *   GET  /notifications               → [{ id, type, title, message, icon, link, read_at, created_at }]
 *   POST /notifications/mark-read
 *
 * Projects say where each kind of notification leads (link()).
 */
class NotificationController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->successResponse($this->present($this->notifications()::latest()->limit(10)->get()));
    }

    public function markAllRead(): JsonResponse
    {
        $this->notifications()::whereNull('read_at')->update(['read_at' => now()]);

        return $this->successResponse(null, 'All notifications marked as read');
    }

    /** The notification model in use (okjt.notifications.model). */
    protected function notifications(): string
    {
        return config('okjt.notifications.model', Notification::class);
    }

    protected function present(Collection $notifications): mixed
    {
        return $notifications->map(fn ($n) => [
            'id' => $n->id,
            'type' => $n->type,
            'title' => $n->data['title'] ?? null,
            'message' => $n->data['message'] ?? null,
            'icon' => $n->data['icon'] ?? 'bell',
            'link' => $this->link($n),
            'read_at' => $n->read_at,
            'created_at' => $n->created_at,
        ])->values();
    }

    /** The dashboard page a notification is about, or null. */
    protected function link(Notification $notification): ?string
    {
        return $notification->data['link'] ?? null;
    }
}
