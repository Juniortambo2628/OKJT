<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubscriberResource;
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
}
