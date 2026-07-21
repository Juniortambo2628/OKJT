<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PageView;
use Illuminate\Http\Request;

class PageViewController extends Controller
{
    /**
     * Paginated list of all page views for the admin dashboard.
     */
    public function index(Request $request)
    {
        $query = PageView::query()->orderBy('created_at', 'desc');

        if ($request->has('path')) {
            $query->where('path', 'like', '%' . $request->path . '%');
        }

        if ($request->has('from')) {
            $query->where('created_at', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->where('created_at', '<=', $request->to);
        }

        return response()->json(
            $query->paginate($request->get('per_page', 50))
        );
    }

    /**
     * Export page views as a downloadable CSV.
     */
    public function export(Request $request)
    {
        $query = PageView::query()->orderBy('created_at', 'desc');

        if ($request->has('from')) {
            $query->where('created_at', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->where('created_at', '<=', $request->to);
        }

        $views = $query->get(['path', 'ip', 'user_agent', 'referrer', 'created_at']);

        $csv = "Path,IP,User Agent,Referrer,Date\n";
        foreach ($views as $v) {
            $csv .= '"' . str_replace('"', '""', $v->path) . '","'
                . $v->ip . '","'
                . str_replace('"', '""', $v->user_agent ?? '') . '","'
                . str_replace('"', '""', $v->referrer ?? '') . '","'
                . $v->created_at . "\"\n";
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="page_views_export.csv"',
        ]);
    }
}
