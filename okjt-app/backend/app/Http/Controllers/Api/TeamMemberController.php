<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TeamMemberResource;
use App\Traits\HandlesStandardCrud;
use Illuminate\Support\Facades\Cache;

class TeamMemberController extends Controller
{
    use HandlesStandardCrud;

    protected $orderByField = 'order';
    protected $orderByDirection = 'asc';

    private function clearCache()
    {
        Cache::forget('all_team_members');
    }

    public function index()
    {
        $team = Cache::rememberForever('all_team_members', function () {
            $model = $this->getModelClass();
            $relations = property_exists($this, 'withRelations') ? $this->withRelations : [];
            $orderBy = property_exists($this, 'orderByField') ? $this->orderByField : 'id';
            $orderDir = property_exists($this, 'orderByDirection') ? $this->orderByDirection : 'asc';

            $query = $model::with($relations);

            if (method_exists($this, 'indexQuery')) {
                $query = $this->indexQuery($query);
            } else {
                $query = $query->orderBy($orderBy, $orderDir);
            }
            return $query->get();
        });

        return TeamMemberResource::collection($team);
    }

    public function show($id)
    {
        $model = $this->getModelClass();
        $relations = property_exists($this, 'withRelations') ? $this->withRelations : [];

        if (!is_numeric($id) && in_array('slug', (new $model)->getFillable())) {
            $record = $model::with($relations)->where('slug', $id)->firstOrFail();
        } else {
            $record = $model::with($relations)->findOrFail($id);
        }

        return new TeamMemberResource($record);
    }

    protected function afterStore($record, $validated, $request)
    {
        $this->clearCache();
        return $record;
    }

    protected function afterUpdate($record, $validated, $request)
    {
        $this->clearCache();
        return $record;
    }

    protected function beforeDelete($record)
    {
        $this->clearCache();
    }

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
