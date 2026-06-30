<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConsultationRequestResource;
use App\Models\ConsultationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ConsultationRequestAdminNotification;
use App\Mail\ConsultationRequestUserReceipt;
use App\Traits\HandlesStandardCrud;

class ConsultationRequestController extends Controller
{
    use HandlesStandardCrud;

    protected $orderByField = 'created_at';
    protected $orderByDirection = 'desc';
    protected $resourceClass = ConsultationRequestResource::class;

    protected function storeRules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string',
        ];
    }

    protected function updateRules(Request $request, $record): array
    {
        return [
            'status' => 'required|string|in:pending,contacted,resolved,archived',
        ];
    }

    protected function afterStore($record, $validated, $request)
    {
        try {
            Mail::to(config('mail.from.address', 'admin@okjtech.co.ke'))
                ->send(new ConsultationRequestAdminNotification($record));

            Mail::to($record->email)
                ->send(new ConsultationRequestUserReceipt($record));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send consultation emails: ' . $e->getMessage());
        }

        return $record;
    }
}
