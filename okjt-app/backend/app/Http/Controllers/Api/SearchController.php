<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InsightResource;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\ServiceResource;
use App\Models\Project;
use App\Models\Service;
use App\Models\Insight;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->get('q', '');
        $type = $request->get('type', 'all');

        if (strlen($q) < 2) {
            return response()->json(['services' => [], 'insights' => [], 'projects' => []]);
        }

        $results = [
            'services' => [],
            'insights' => [],
            'projects' => [],
        ];

        if ($type === 'all' || $type === 'services') {
            $results['services'] = ServiceResource::collection(Service::where('is_active', true)
                ->where(function ($query) use ($q) {
                    $query->where('title', 'like', "%{$q}%")
                        ->orWhere('description', 'like', "%{$q}%")
                        ->orWhere('category', 'like', "%{$q}%");
                })
                ->orderByRaw("CASE 
                    WHEN title LIKE ? THEN 1 
                    WHEN title LIKE ? THEN 2 
                    ELSE 3 END", ["{$q}", "{$q}%"])
                ->select('id', 'title', 'slug', 'category', 'description')
                ->limit(10)
                ->get());
        }

        if ($type === 'all' || $type === 'insights') {
            $results['insights'] = InsightResource::collection(Insight::where('is_published', true)
                ->where(function ($query) use ($q) {
                    $query->where('title', 'like', "%{$q}%")
                        ->orWhere('excerpt', 'like', "%{$q}%")
                        ->orWhere('category', 'like', "%{$q}%");
                })
                ->orderByRaw("CASE 
                    WHEN title LIKE ? THEN 1 
                    WHEN title LIKE ? THEN 2 
                    ELSE 3 END", ["{$q}", "{$q}%"])
                ->select('id', 'title', 'slug', 'category', 'excerpt')
                ->limit(10)
                ->get());
        }

        if ($type === 'all' || $type === 'projects') {
            $results['projects'] = ProjectResource::collection(Project::where('is_active', true)
                ->where(function ($query) use ($q) {
                    $query->where('title', 'like', "%{$q}%")
                        ->orWhere('client_name', 'like', "%{$q}%")
                        ->orWhere('category', 'like', "%{$q}%");
                })
                ->orderByRaw("CASE 
                    WHEN title LIKE ? THEN 1 
                    WHEN title LIKE ? THEN 2 
                    ELSE 3 END", ["{$q}", "{$q}%"])
                ->select('id', 'title', 'slug', 'client_name', 'category')
                ->limit(10)
                ->get());
        }

        return response()->json($results);
    }
}
