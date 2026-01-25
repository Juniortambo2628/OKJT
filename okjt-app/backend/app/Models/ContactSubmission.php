<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Tags\HasTags;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Laravel\Scout\Searchable;

class ContactSubmission extends Model
{
    use HasFactory, LogsActivity, HasTags, Searchable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'country_code',
        'phone_number',
        'contact_method',
        'online_consultation',
        'consultation_date',
        'consultation_time',
        'message',
        'consent',
        'ip_address',
        'processed',
        'status',
        'admin_message',
        'status_updated_at',
        'updated_by',
    ];

    protected $casts = [
        'online_consultation' => 'boolean',
        'consent' => 'boolean',
        'processed' => 'boolean',
        'consultation_date' => 'date',
        'status_updated_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];

    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone_number ?: $this->phone,
            'message' => $this->message,
            'status' => $this->status,
            'contact_method' => $this->contact_method,
        ];
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeWithConsultation($query)
    {
        return $query->where('online_consultation', true);
    }

    public function scopeUpcoming($query, $days = 7)
    {
        return $query->whereNotNull('consultation_date')
            ->whereNotNull('consultation_time')
            ->whereDate('consultation_date', '>=', now()->toDateString())
            ->whereDate('consultation_date', '<=', now()->addDays($days)->toDateString())
            ->whereIn('status', ['pending', 'accepted', 'completed']);
    }

    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable')->latest();
    }

    public static function getBookedTimesForDate($date)
    {
        return self::where('consultation_date', $date)
            ->where('online_consultation', true)
            ->pluck('consultation_time')
            ->toArray();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'status', 'admin_message', 'consultation_date', 'consultation_time'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

