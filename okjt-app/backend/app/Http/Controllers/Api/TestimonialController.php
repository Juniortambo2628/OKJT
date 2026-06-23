<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TestimonialResource;
use App\Traits\HandlesStandardCrud;
use Illuminate\Database\Eloquent\Builder;

class TestimonialController extends Controller
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

        return TestimonialResource::collection($query->get());
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

        return new TestimonialResource($record);
    }

    protected function indexQuery(Builder $query): Builder
    {
        return $query->where('is_featured', true)->orderBy('order');
    }

    protected function storeRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'quote' => 'required|string',
            'avatar' => 'nullable|string',
            'rating' => 'integer|min:1|max:5',
            'is_featured' => 'boolean',
            'order' => 'integer',
        ];
    }

    protected function updateRules(): array
    {
        return [
            'name' => 'string|max:255',
            'role' => 'string|max:255',
            'company' => 'string|max:255',
            'quote' => 'string',
            'avatar' => 'nullable|string',
            'rating' => 'integer|min:1|max:5',
            'is_featured' => 'boolean',
            'order' => 'integer',
        ];
    }
}
