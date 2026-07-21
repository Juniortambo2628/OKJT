<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ValueResource;
use App\Traits\HandlesStandardCrud;
use Illuminate\Http\Request;

class ValueController extends Controller
{
    use HandlesStandardCrud;

    protected $orderByField = 'order';

    protected $orderByDirection = 'asc';

    protected $cacheKey = 'all_values';

    protected $resourceClass = ValueResource::class;

    protected function storeRules(Request $request): array
    {
        return [
            'icon' => 'nullable|string|max:255',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'order' => 'nullable|integer',
        ];
    }

    protected function updateRules(Request $request, $record): array
    {
        return [
            'icon' => 'nullable|string|max:255',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'order' => 'nullable|integer',
        ];
    }
}
