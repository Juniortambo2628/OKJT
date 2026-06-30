<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubscriberResource;
use App\Models\Subscriber;
use Illuminate\Http\Request;
use App\Traits\HandlesStandardCrud;

class SubscriberController extends Controller
{
    use HandlesStandardCrud;

    protected $orderByField = 'created_at';
    protected $orderByDirection = 'desc';
    protected $resourceClass = SubscriberResource::class;

    protected function storeRules(): array
    {
        return [
            'email' => 'required|email|unique:subscribers,email',
            'name' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:100',
        ];
    }
}
