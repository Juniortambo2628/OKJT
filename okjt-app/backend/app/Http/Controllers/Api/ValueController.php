<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ValueResource;
use Illuminate\Http\Request;
use App\Traits\HandlesStandardCrud;
use Illuminate\Support\Facades\Cache;

class ValueController extends Controller
{
    use HandlesStandardCrud;

    protected $orderByField = 'order';
    protected $orderByDirection = 'asc';

    private function clearCache()
    {
        Cache::forget('all_values');
    }

    public function index()
    {
        $values = Cache::rememberForever('all_values', function () {
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

        return ValueResource::collection($values);
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

        return new ValueResource($record);
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
