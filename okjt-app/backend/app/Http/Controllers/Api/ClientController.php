<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClientResource;
use Illuminate\Http\Request;
use App\Traits\HandlesStandardCrud;

class ClientController extends Controller
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

        return ClientResource::collection($query->get());
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

        return new ClientResource($record);
    }

    public function indexQuery($query)
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
