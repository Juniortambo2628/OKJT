<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PageView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    // Public — log a page view
    public function track(Request $request)
    {
        $request->validate([
            'path' => 'required|string|max:500',
        ]);

        PageView::create([
            'path' => $request->path,
            'referrer' => $request->header('referer'),
            'user_agent' => substr($request->userAgent() ?? '', 0, 500),
            'ip' => $request->ip(),
        ]);

        return response()->json(['ok' => true], 201);
    }

    // Protected — admin summary
    public function summary(Request $request)
    {
        $now = Carbon::now();

        // Total counts
        $totalViews = PageView::count();
        $todayViews = PageView::whereDate('created_at', $now->toDateString())->count();
        $weekViews = PageView::where('created_at', '>=', $now->subDays(7))->count();
        $monthViews = PageView::where('created_at', '>=', Carbon::now()->subDays(30))->count();

        // Unique IPs (proxy for unique visitors)
        $uniqueVisitors = PageView::where('created_at', '>=', Carbon::now()->subDays(30))
            ->distinct('ip')->count('ip');

        // Top pages (last 30 days)
        $topPages = PageView::where('created_at', '>=', Carbon::now()->subDays(30))
            ->select('path', DB::raw('COUNT(*) as views'))
            ->groupBy('path')
            ->orderByDesc('views')
            ->limit(10)
            ->get();

        // Views over time (last 14 days)
        $viewsOverTime = PageView::where('created_at', '>=', Carbon::now()->subDays(14))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as views'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top referrers
        $topReferrers = PageView::where('created_at', '>=', Carbon::now()->subDays(30))
            ->whereNotNull('referrer')
            ->where('referrer', '!=', '')
            ->select('referrer', DB::raw('COUNT(*) as count'))
            ->groupBy('referrer')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        return response()->json([
            'total_views' => $totalViews,
            'today_views' => $todayViews,
            'week_views' => $weekViews,
            'month_views' => $monthViews,
            'unique_visitors' => $uniqueVisitors,
            'top_pages' => $topPages,
            'views_over_time' => $viewsOverTime,
            'top_referrers' => $topReferrers,
        ]);
    }
}
