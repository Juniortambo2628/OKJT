<?php

namespace Okjt\Kit\Console;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/** One action platform staff took in the console, and to what. Append-only. */
class AuditLog extends Model
{
    public const UPDATED_AT = null;

    protected $table = 'console_audit_logs';

    protected $fillable = ['user_id', 'action', 'subject_type', 'subject_id', 'subject_label', 'details', 'ip'];

    protected function casts(): array
    {
        return ['details' => 'array', 'created_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(config('okjt.user_model'));
    }

    /** Record $action on a record (a workspace, an account); its type is its class name ("project"). */
    public static function record(string $action, Model $subject, array $details = []): static
    {
        return static::write($action, static::subjectType($subject), $subject->getKey(), $subject->name, $details);
    }

    /** Record $action on something that isn't a record, e.g. ('site', 'Home page photo'). */
    public static function recordAbout(string $action, string $type, string $label, array $details = []): static
    {
        return static::write($action, $type, null, $label, $details);
    }

    public static function subjectType(Model $subject): string
    {
        return Str::snake(class_basename($subject));
    }

    protected static function write(string $action, string $type, mixed $id, ?string $label, array $details): static
    {
        $request = request();

        return static::create([
            'user_id' => $request?->user()?->id,
            'action' => $action,
            'subject_type' => $type,
            'subject_id' => $id,
            'subject_label' => $label,
            'details' => $details ?: null,
            'ip' => $request?->ip(),
        ]);
    }
}
