<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StatResource;
use Illuminate\Http\Request;
use App\Traits\HandlesStandardCrud;

class StatController extends Controller
{
    use HandlesStandardCrud;

    protected $orderByField = 'order';
    protected $orderByDirection = 'asc';
    protected $cacheKey = 'all_stats';
    protected $resourceClass = StatResource::class;

    protected function storeRules(Request $request): array
    {
        return [
            'label' => 'required|string',
            'value' => 'required|string',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'order' => 'integer',
        ];
    }

    protected function updateRules(Request $request, $record): array
    {
        return [
            'label' => 'string',
            'value' => 'string',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'order' => 'integer',
        ];
    }
}
