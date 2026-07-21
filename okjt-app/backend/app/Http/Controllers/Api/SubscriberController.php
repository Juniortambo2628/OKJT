<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubscriberResource;
use App\Models\Subscriber;
use App\Traits\HandlesStandardCrud;
use Illuminate\Http\Request;

class SubscriberController extends Controller
{
    use HandlesStandardCrud;

    protected $orderByField = 'created_at';

    protected $orderByDirection = 'desc';

    protected $resourceClass = SubscriberResource::class;

    protected function storeRules(Request $request): array
    {
        return [
            'email' => 'required|email|unique:subscribers,email',
            'name' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:100',
        ];
    }

    /**
     * Public unsubscribe endpoint.
     * Deactivates the subscriber by email address.
     */
    public function unsubscribe(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $subscriber = Subscriber::where('email', $request->email)->first();

        if (! $subscriber) {
            return response()->json(['message' => 'Email not found.'], 404);
        }

        $subscriber->update(['is_active' => false]);

        return response()->json(['message' => 'You have been unsubscribed successfully.']);
    }
}
