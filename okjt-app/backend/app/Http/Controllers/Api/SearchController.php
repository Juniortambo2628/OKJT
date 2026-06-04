<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Insight;
use App\Models\CaseStudy;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->get('q', '');
        $type = $request->get('type', 'all'); // all, services, insights, case_studies

        if (strlen($q) < 2) {
            return response()->json(['services' => [], 'insights' => [], 'case_studies' => []]);
        }

        $results = [
            'services' => [],
            'insights' => [],
            'case_studies' => [],
        ];

        if ($type === 'all' || $type === 'services') {
            $results['services'] = Service::where('is_active', true)
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
                ->get();
        }

        if ($type === 'all' || $type === 'insights') {
            $results['insights'] = Insight::where('is_published', true)
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
                ->get();
        }

        if ($type === 'all' || $type === 'case_studies') {
            $results['case_studies'] = CaseStudy::where(function ($query) use ($q) {
                    $query->where('title', 'like', "%{$q}%")
                        ->orWhere('client_name', 'like', "%{$q}%");
                })
                ->orderByRaw("CASE 
                    WHEN title LIKE ? THEN 1 
                    WHEN title LIKE ? THEN 2 
                    ELSE 3 END", ["{$q}", "{$q}%"])
                ->select('id', 'title', 'slug', 'client_name')
                ->limit(10)
                ->get();
        }

        return response()->json($results);
    }
}
