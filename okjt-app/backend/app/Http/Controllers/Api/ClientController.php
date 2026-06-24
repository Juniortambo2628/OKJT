<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClientResource;
use Illuminate\Http\Request;
use App\Traits\HandlesStandardCrud;
use Illuminate\Support\Facades\Cache;

class ClientController extends Controller
{
    use HandlesStandardCrud;

    protected $orderByField = 'order';
    protected $orderByDirection = 'asc';

    private function clearCache()
    {
        Cache::forget('clients_public');
        Cache::forget('clients_admin');
    }

    public function index()
    {
        $isAdmin = request()->user('sanctum') ? true : false;
        $cacheKey = $isAdmin ? 'clients_admin' : 'clients_public';

        $clients = Cache::rememberForever($cacheKey, function () {
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

        return ClientResource::collection($clients);
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
