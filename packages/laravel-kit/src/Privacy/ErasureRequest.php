<?php

namespace Okjt\Kit\Privacy;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Okjt\Kit\Workspace\CurrentWorkspace;

/**
 * Someone asking for their data to be deleted, from Naoa (ErasureRequest).
 * It must be dealt with by due_at (okjt.privacy.erasure_days after it came
 * in): erased (the project's erasers run, see Eraser) or declined with a
 * reason the person is given. The request itself is kept as the record that
 * it was dealt with; it holds only what the person gave to be found by.
 *
 * subject_id: the project's own record for this person (a guest, a
 * customer), when one is known; erasers may use it.
 */
class ErasureRequest extends Model
{
    public const RECEIVED = 'received';

    public const DONE = 'done';

    public const DECLINED = 'declined';

    public const STATUSES = [self::RECEIVED, self::DONE, self::DECLINED];

    protected $table = 'okjt_erasure_requests';

    protected $fillable = ['name', 'email', 'phone', 'details', 'subject_id', 'status', 'due_at', 'completed_at', 'handled_by', 'outcome'];

    protected $casts = ['due_at' => 'datetime', 'completed_at' => 'datetime'];

    protected $attributes = ['status' => self::RECEIVED];

    protected static function booted(): void
    {
        static::addGlobalScope('workspace', function (Builder $query) {
            if (config('okjt.privacy.per_workspace') && ($id = CurrentWorkspace::id())) {
                $query->where($query->getModel()->qualifyColumn('workspace_id'), $id);
            }
        });
        static::creating(function (ErasureRequest $request) {
            if (config('okjt.privacy.per_workspace') && empty($request->workspace_id)) {
                $request->workspace_id = CurrentWorkspace::id();
            }
            $request->due_at ??= now()->addDays((int) config('okjt.privacy.erasure_days', 14));
        });
    }

    public function isOpen(): bool
    {
        return $this->status === self::RECEIVED;
    }

    public function isOverdue(): bool
    {
        return $this->isOpen() && $this->due_at->isPast();
    }

    public function present(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'details' => $this->details,
            'subject_id' => $this->subject_id,
            'status' => $this->status,
            'overdue' => $this->isOverdue(),
            'due_at' => $this->due_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'outcome' => $this->outcome,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
