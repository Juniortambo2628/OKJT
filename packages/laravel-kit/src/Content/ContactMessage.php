<?php

namespace Okjt\Kit\Content;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Okjt\Kit\Workspace\CurrentWorkspace;

/**
 * A message sent through the site's contact form. From Naoa (Enquiry: status,
 * reply by email) and Tena-host (ContactController: limits, a support
 * address). Personal data, so: no IP address is kept, it isn't copied into
 * the version history, and messages older than okjt.contact.keep_days are
 * pruned (`php artisan model:prune`; null keeps them).
 *
 * status: new → read (opened in the admin) → replied, or archived.
 */
class ContactMessage extends Model
{
    use MassPrunable;

    public const STATUSES = ['new', 'read', 'replied', 'archived'];

    protected $table = 'okjt_contact_messages';

    protected $fillable = ['name', 'email', 'topic', 'subject', 'message', 'status', 'reply_message', 'replied_at', 'replied_by'];

    protected $casts = ['replied_at' => 'datetime'];

    protected static function booted(): void
    {
        static::addGlobalScope('workspace', function (Builder $query) {
            if (config('okjt.contact.per_workspace') && ($id = CurrentWorkspace::id())) {
                $query->where($query->getModel()->qualifyColumn('workspace_id'), $id);
            }
        });
        static::creating(function (ContactMessage $message) {
            if (config('okjt.contact.per_workspace') && empty($message->workspace_id)) {
                $message->workspace_id = CurrentWorkspace::id();
            }
        });
    }

    public function prunable(): Builder
    {
        $days = config('okjt.contact.keep_days');

        return $days ? static::withoutGlobalScopes()->where('created_at', '<', now()->subDays((int) $days)) : static::withoutGlobalScopes()->whereRaw('1 = 0');
    }

    public function present(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'topic' => $this->topic,
            'subject' => $this->subject,
            'message' => $this->message,
            'status' => $this->status,
            'reply_message' => $this->reply_message,
            'replied_at' => $this->replied_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
