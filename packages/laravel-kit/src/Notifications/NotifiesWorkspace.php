<?php

namespace Okjt\Kit\Notifications;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Okjt\Kit\Workspace\CurrentWorkspace;

/**
 * For controllers whose actions the workspace's people should hear about
 * (`$this->notifyAdmin('GiftClaimed', 'Gift claimed', "…", 'gift')`). The
 * notification is addressed to the workspace's first owner; everyone on the
 * workspace sees it. Never fails the request it is part of.
 */
trait NotifiesWorkspace
{
    protected function notifyAdmin(string $type, string $title, string $message, string $icon = 'bell', array $extra = []): void
    {
        try {
            $users = config('okjt.user_model');
            $ownerId = CurrentWorkspace::id()
                ? DB::table(config('okjt.workspace.members_table'))
                    ->where(CurrentWorkspace::column(), CurrentWorkspace::id())
                    ->where('role', config('okjt.roles.owner'))
                    ->orderBy('user_id')->value('user_id')
                : null;

            config('okjt.notifications.model', Notification::class)::create([
                'id' => Str::uuid(),
                'type' => $type,
                'notifiable_type' => $users,
                'notifiable_id' => $ownerId ?? $users::first()?->id ?? 1,
                'data' => array_merge(['title' => $title, 'message' => $message, 'icon' => $icon], $extra),
            ]);
        } catch (\Exception $e) {
            Log::warning('Failed to create admin notification: '.$e->getMessage());
        }
    }
}
