<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InsightResource;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\ServiceResource;
use App\Models\Insight;
use App\Models\Project;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    protected function applySearchRanking($query, string $q)
    {
        return $query->orderByRaw('CASE 
            WHEN title LIKE ? THEN 1 
            WHEN title LIKE ? THEN 2 
            ELSE 3 END', ["{$q}", "{$q}%"]);
    }

    /**
     * Match the given columns against the query.
     *
     * MySQL uses the FULLTEXT indexes added by
     * 2026_06_23_000002_add_fulltext_indexes.php (natural language mode). The
     * SQLite grammar has no FULLTEXT implementation and throws, so local
     * development keeps the original LIKE behaviour.
     *
     * Note: FULLTEXT matches whole tokens, not substrings, and ignores words
     * shorter than innodb_ft_min_token_size (3 by default).
     */
    protected function applyTextSearch($query, string $q, array $columns)
    {
        if (in_array(DB::getDriverName(), ['mysql', 'mariadb', 'pgsql'], true)) {
            return $query->whereFullText($columns, $q);
        }

        return $query->where(function ($sub) use ($columns, $q) {
            foreach ($columns as $index => $column) {
                if ($index === 0) {
                    $sub->where($column, 'like', "%{$q}%");
                } else {
                    $sub->orWhere($column, 'like', "%{$q}%");
                }
            }
        });
    }

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
                ->tap(fn ($query) => $this->applyTextSearch($query, $q, ['title', 'description', 'category']))
                ->tap(fn ($qBuilder) => $this->applySearchRanking($qBuilder, $q))
                ->select('id', 'title', 'slug', 'category', 'description')
                ->limit(10)
                ->get());
        }

        if ($type === 'all' || $type === 'insights') {
            $results['insights'] = InsightResource::collection(Insight::where('is_published', true)
                ->tap(fn ($query) => $this->applyTextSearch($query, $q, ['title', 'excerpt', 'category']))
                ->tap(fn ($qBuilder) => $this->applySearchRanking($qBuilder, $q))
                ->select('id', 'title', 'slug', 'category', 'excerpt')
                ->limit(10)
                ->get());
        }

        if ($type === 'all' || $type === 'projects') {
            $results['projects'] = ProjectResource::collection(Project::where('is_active', true)
                ->tap(fn ($query) => $this->applyTextSearch($query, $q, ['title', 'client_name', 'category']))
                ->tap(fn ($qBuilder) => $this->applySearchRanking($qBuilder, $q))
                ->select('id', 'title', 'slug', 'client_name', 'category')
                ->limit(10)
                ->get());
        }

        return response()->json($results);
    }
}
