<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TeamMemberResource;
use App\Traits\HandlesStandardCrud;

class TeamMemberController extends Controller
{
    use HandlesStandardCrud;

    protected $orderByField = 'order';
    protected $orderByDirection = 'asc';
    protected $cacheKey = 'all_team_members';
    protected $resourceClass = TeamMemberResource::class;

    protected function storeRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'qualifications' => 'nullable|string|max:255',
            'linkedin' => 'nullable|string|url',
            'image' => 'nullable|string',
            'order' => 'nullable|integer',
        ];
    }

    protected function updateRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'qualifications' => 'nullable|string|max:255',
            'linkedin' => 'nullable|string|url',
            'image' => 'nullable|string',
            'order' => 'nullable|integer',
        ];
    }
}
