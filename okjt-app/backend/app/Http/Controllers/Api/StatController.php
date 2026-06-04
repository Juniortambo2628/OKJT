<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Traits\HandlesStandardCrud;

class StatController extends Controller
{
    use HandlesStandardCrud;

    protected $orderByField = 'order';
    protected $orderByDirection = 'asc';

    protected function storeRules(Request $request): array
    {
        return [
            'label' => 'required|string',
            'value' => 'required|string',
            'icon' => 'nullable|string',
            'order' => 'integer',
        ];
    }

    protected function updateRules(Request $request, $record): array
    {
        return [
            'label' => 'string',
            'value' => 'string',
            'icon' => 'nullable|string',
            'order' => 'integer',
        ];
    }
}
