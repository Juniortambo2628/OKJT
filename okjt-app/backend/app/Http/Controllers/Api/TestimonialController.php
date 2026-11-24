<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TestimonialResource;
use App\Traits\HandlesStandardCrud;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TestimonialController extends Controller
{
    use HandlesStandardCrud;

    protected $orderByField = 'order';

    protected $orderByDirection = 'asc';

    protected $resourceClass = TestimonialResource::class;

    protected function getCacheKey(): ?string
    {
        return request()->user('sanctum') ? 'all_testimonials_admin' : 'all_testimonials';
    }

    protected function clearCache(): void
    {
        Cache::forget('all_testimonials');
        Cache::forget('all_testimonials_admin');
    }

    protected function indexQuery(Builder $query): Builder
    {
        if (! request()->user('sanctum')) {
            $query->where('is_featured', true);
        }

        return $query->orderBy('order');
    }

    protected function storeRules(Request $request): array
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

    protected function updateRules(Request $request, $record): array
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
