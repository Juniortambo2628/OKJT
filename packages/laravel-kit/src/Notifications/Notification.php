<?php

namespace Okjt\Kit\Notifications;

use Illuminate\Database\Eloquent\Model;
use Okjt\Kit\Workspace\BelongsToWorkspace;

/**
 * Something the workspace's people should see in the dashboard's bell: a new
 * RSVP, a gift claimed, a question asked. Laravel's `notifications` table,
 * scoped to the workspace; `data` holds title, message, icon and anything a
 * link needs.
 */
class Notification extends Model
{
    use BelongsToWorkspace;

    protected $table = 'notifications';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = ['id', 'type', 'notifiable_type', 'notifiable_id', 'data', 'read_at'];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];
}
