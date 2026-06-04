<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubscriberResource;
use App\Models\Subscriber;
use Illuminate\Http\Request;

class SubscriberController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:subscribers,email',
            'name' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:100',
        ]);

        $subscriber = Subscriber::create($validated);
        return new SubscriberResource($subscriber);
    }

    public function index()
    {
        return SubscriberResource::collection(Subscriber::orderByDesc('created_at')->get());
    }

    public function destroy(Subscriber $subscriber)
    {
        $subscriber->delete();
        return response()->json(null, 204);
    }
}

