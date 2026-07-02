<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RsvpResource;
use App\Models\Rsvp;
use Illuminate\Http\Request;
use App\Mail\RsvpConfirmation;
use Illuminate\Support\Facades\Mail;
use App\Traits\HandlesStandardCrud;

class RsvpController extends Controller
{
    use HandlesStandardCrud;

    protected $orderByField = 'created_at';
    protected $orderByDirection = 'desc';
    protected $resourceClass = RsvpResource::class;

    protected function storeRules(Request $request): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:rsvps,email',
            'company' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'sector' => 'nullable|string|max:255',
            'interest' => 'nullable|string|max:255',
            'consent' => 'boolean',
            'newsletter' => 'boolean',
            'attendance' => 'nullable|string|max:255',
            'type' => 'nullable|string|in:rsvp,early_access',
        ];
    }

    protected function updateRules(Request $request, $record): array
    {
        return [
            'attendance' => 'nullable|string|max:255',
            'type' => 'nullable|string|in:rsvp,early_access',
        ];
    }

    protected function afterStore($record, $validated, $request)
    {
        try {
            Mail::to($record->email)->queue(new RsvpConfirmation($record));
        } catch (\Exception $e) {
            logger()->error("Failed to send RSVP confirmation mail: " . $e->getMessage());
        }

        return $record;
    }
}
