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

    public function index()
    {
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

        return StatResource::collection($query->get());
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

        return new StatResource($record);
    }

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
