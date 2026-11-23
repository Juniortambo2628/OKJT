<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RsvpResource;
use App\Traits\HandlesStandardCrud;
use Illuminate\Http\Request;

/**
 * RSVPs and early-access sign-ups from the 2026 launch, kept for the
 * dashboard to read, correct or delete. The public form and its endpoint
 * are gone, so nothing new arrives.
 */
class RsvpController extends Controller
{
    use HandlesStandardCrud;

    protected $orderByField = 'created_at';

    protected $orderByDirection = 'desc';

    protected $resourceClass = RsvpResource::class;

    protected function updateRules(Request $request, $record): array
    {
        return [
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:rsvps,email,'.$record->id,
            'company' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'sector' => 'nullable|string|max:255',
            'interest' => 'nullable|string|max:255',
            'consent' => 'boolean',
            'newsletter' => 'boolean',
            'attendance' => 'nullable|string|in:accepted,declined',
            'type' => 'nullable|string|in:rsvp,early_access',
        ];
    }
}
