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
    protected $cacheKey = 'all_testimonials';
    protected $resourceClass = TestimonialResource::class;

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
