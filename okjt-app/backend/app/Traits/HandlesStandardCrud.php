<?php

namespace App\Traits;

use Illuminate\Http\Request;

trait HandlesStandardCrud
{
    /**
     * Get the model class name.
     */
    protected function getModelClass(): string
    {
        if (property_exists($this, 'modelClass')) {
            return $this->modelClass;
        }

        $className = class_basename($this);
        $modelName = str_replace('Controller', '', $className);
        return 'App\\Models\\' . $modelName;
    }

    /**
     * Display a listing of the resource.
     */
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

        return response()->json($query->get());
    }

    /**
     * Store a newly created resource in storage.
     */
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

        return response()->json($record, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $model = $this->getModelClass();
        $relations = property_exists($this, 'withRelations') ? $this->withRelations : [];

        // Support both ID and Slug lookup
        if (!is_numeric($id) && in_array('slug', (new $model)->getFillable())) {
            $record = $model::with($relations)->where('slug', $id)->firstOrFail();
        } else {
            $record = $model::with($relations)->findOrFail($id);
        }

        return response()->json($record);
    }

    /**
     * Update the specified resource in storage.
     */
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

        return response()->json($record);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $model = $this->getModelClass();
        $record = $model::findOrFail($id);

        if (method_exists($this, 'beforeDelete')) {
            $this->beforeDelete($record);
        }

        $record->delete();

        return response()->json(null, 204);
    }
}
