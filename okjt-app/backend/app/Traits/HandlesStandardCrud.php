<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

trait HandlesStandardCrud
{
    protected function getModelClass(): string
    {
        if (property_exists($this, 'modelClass')) {
            return $this->modelClass;
        }

        $className = class_basename($this);
        $modelName = str_replace('Controller', '', $className);
        return 'App\\Models\\' . $modelName;
    }

    protected function getResourceClass(): ?string
    {
        if (property_exists($this, 'resourceClass')) {
            return $this->resourceClass;
        }
        return null;
    }

    protected function getCacheKey(): ?string
    {
        if (property_exists($this, 'cacheKey')) {
            return $this->cacheKey;
        }
        return null;
    }

    protected function clearCache(): void
    {
        $key = $this->getCacheKey();
        if ($key) {
            Cache::forget($key);
        }
    }

    protected function resolveRouteBinding($value, $field = null)
    {
        $model = $this->getModelClass();
        $relations = property_exists($this, 'withRelations') ? $this->withRelations : [];
        
        $field = $field ?? 'id';
        
        return $model::with($relations)->where($field, $value)->firstOrFail();
    }

    protected function buildIndexQuery(): Builder
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

        return $query;
    }

    public function index()
    {
        $cacheKey = $this->getCacheKey();

        if ($cacheKey) {
            $results = Cache::rememberForever($cacheKey, fn () => $this->buildIndexQuery()->get());
        } else {
            $results = $this->buildIndexQuery()->get();
        }

        $resourceClass = $this->getResourceClass();
        if ($resourceClass) {
            return $resourceClass::collection($results);
        }

        return response()->json($results);
    }

    public function store(Request $request)
    {
        $rules = method_exists($this, 'storeRules') ? $this->storeRules($request) : (property_exists($this, 'storeRules') ? $this->storeRules : []);
        $validated = $request->validate($rules);

        if (method_exists($this, 'beforeStore')) {
            $validated = $this->beforeStore($validated, $request);
        }

        $model = $this->getModelClass();
        $record = $model::create($validated);

        if (method_exists($this, 'afterStore')) {
            $record = $this->afterStore($record, $validated, $request);
        }

        $this->clearCache();

        $resourceClass = $this->getResourceClass();
        if ($resourceClass) {
            return new $resourceClass($record);
        }

        return response()->json($record, 201);
    }

    public function show($id)
    {
        $model = $this->getModelClass();
        $relations = property_exists($this, 'withRelations') ? $this->withRelations : [];
        
        $field = property_exists($this, 'routeBindingField') ? $this->routeBindingField : 'id';
        
        $record = $model::with($relations)->where($field, $id)->firstOrFail();

        $resourceClass = $this->getResourceClass();
        if ($resourceClass) {
            return new $resourceClass($record);
        }

        return response()->json($record);
    }

    public function update(Request $request, $id)
    {
        $model = $this->getModelClass();
        $record = $model::findOrFail($id);

        $rules = method_exists($this, 'updateRules') ? $this->updateRules($request, $record) : (property_exists($this, 'updateRules') ? $this->updateRules : []);
        $validated = $request->validate($rules);

        if (method_exists($this, 'beforeUpdate')) {
            $validated = $this->beforeUpdate($record, $validated, $request);
        }

        $record->update($validated);

        if (method_exists($this, 'afterUpdate')) {
            $record = $this->afterUpdate($record, $validated, $request);
        }

        $this->clearCache();

        $resourceClass = $this->getResourceClass();
        if ($resourceClass) {
            return new $resourceClass($record);
        }

        return response()->json($record);
    }

    public function destroy($id)
    {
        $model = $this->getModelClass();
        $record = $model::withTrashed()->findOrFail($id);

        if (method_exists($this, 'beforeDelete')) {
            $this->beforeDelete($record);
        }

        if ($record->trashed()) {
            $record->forceDelete();
        } else {
            $record->delete();
        }
        $this->clearCache();

        return response()->json(null, 204);
    }
}
