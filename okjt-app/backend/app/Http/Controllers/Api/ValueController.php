<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ValueResource;
use Illuminate\Http\Request;
use App\Traits\HandlesStandardCrud;

class ValueController extends Controller
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

        return ValueResource::collection($query->get());
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
