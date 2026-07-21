<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClientResource;
use App\Traits\HandlesStandardCrud;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    use HandlesStandardCrud;

    protected $orderByField = 'order';

    protected $orderByDirection = 'asc';

    protected $cacheKey = 'clients_all';

    protected $resourceClass = ClientResource::class;

    protected function indexQuery($query)
    {
        if (request()->user('sanctum')) {
            return $query->orderBy('order');
        }

        return $query->where('is_active', true)->orderBy('order');
    }

    protected function storeRules(Request $request): array
    {
        return [
            'name' => 'required|string|max:255',
            'logo' => 'nullable|string',
            'website' => 'nullable|string|url',
            'category' => 'nullable|string|max:100',
            'is_active' => 'boolean',
            'order' => 'integer',
        ];
    }

    protected function updateRules(Request $request, $record): array
    {
        return [
            'name' => 'string|max:255',
            'logo' => 'nullable|string',
            'website' => 'nullable|string|url',
            'category' => 'nullable|string|max:100',
            'is_active' => 'boolean',
            'order' => 'integer',
        ];
    }
}
