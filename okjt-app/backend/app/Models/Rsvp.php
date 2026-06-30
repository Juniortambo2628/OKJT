<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rsvp extends Model
{
    protected $fillable = [
        'name',
        'email',
        'company',
        'job_title',
        'sector',
        'interest',
        'consent',
        'newsletter',
        'attendance',
        'type',
    ];

    protected $casts = [
        'consent' => 'boolean',
        'newsletter' => 'boolean',
        'type' => 'string',
        'attendance' => 'string',
    ];
}
