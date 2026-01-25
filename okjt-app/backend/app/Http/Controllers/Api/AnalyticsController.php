<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function trackPageVisit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'required|string|max:255',
        ]);

        DB::table('analytics_page_visits')->insert([
            'page' => $validated['page'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'referrer' => $request->header('referer'),
            'session_id' => $request->cookie('session_id') ?? $request->header('X-Session-ID'),
            'visited_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }

    public function trackClick(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'element_id' => 'required|string|max:255',
            'element_type' => 'required|string|max:100',
            'page' => 'required|string|max:255',
            'x_position' => 'nullable|integer',
            'y_position' => 'nullable|integer',
        ]);

        DB::table('analytics_clicks')->insert([
            'element_id' => $validated['element_id'],
            'element_type' => $validated['element_type'],
            'page' => $validated['page'],
            'ip_address' => $request->ip(),
            'session_id' => $request->cookie('session_id') ?? $request->header('X-Session-ID'),
            'x_position' => $validated['x_position'] ?? null,
            'y_position' => $validated['y_position'] ?? null,
            'clicked_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }

    public function trackFormSubmission(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'form_type' => 'required|string|max:100',
            'success' => 'required|boolean',
            'page' => 'nullable|string|max:255',
        ]);

        DB::table('analytics_form_submissions')->insert([
            'form_type' => $validated['form_type'],
            'success' => $validated['success'],
            'page' => $validated['page'] ?? $request->header('referer') ?? '/',
            'ip_address' => $request->ip(),
            'session_id' => $request->cookie('session_id') ?? $request->header('X-Session-ID'),
            'submitted_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }

    public function getDashboardStats(Request $request): JsonResponse
    {
        $days = $request->get('days', 30);
        $startDate = now()->subDays($days);

        // Get total projects
        $totalProjects = DB::table('portfolio_projects')->count();
        
        // Get submissions stats
        $totalSubmissions = DB::table('contact_submissions')->count();
        $pendingSubmissions = DB::table('contact_submissions')
            ->where('status', 'pending')
            ->count();

        $stats = [
            'total_projects' => $totalProjects,
            'total_submissions' => $totalSubmissions,
            'pending_submissions' => $pendingSubmissions,
            'page_visits' => DB::table('analytics_page_visits')
                ->where('visited_at', '>=', $startDate)
                ->count(),
            'unique_visitors' => DB::table('analytics_page_visits')
                ->where('visited_at', '>=', $startDate)
                ->distinct('ip_address')
                ->count(),
            'total_clicks' => DB::table('analytics_clicks')
                ->where('clicked_at', '>=', $startDate)
                ->count(),
            'form_submissions' => DB::table('analytics_form_submissions')
                ->where('submitted_at', '>=', $startDate)
                ->where('success', true)
                ->count(),
            'top_pages' => DB::table('analytics_page_visits')
                ->select('page', DB::raw('COUNT(*) as visits'))
                ->where('visited_at', '>=', $startDate)
                ->groupBy('page')
                ->orderByDesc('visits')
                ->limit(10)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get page views over time
     */
    public function getPageViews(Request $request): JsonResponse
    {
        $period = $request->get('period', '7d');
        $days = match($period) {
            '24h' => 1,
            '7d' => 7,
            '30d' => 30,
            '90d' => 90,
            default => 7,
        };
        
        $startDate = now()->subDays($days);

        $pageViews = DB::table('analytics_page_visits')
            ->select(DB::raw('DATE(visited_at) as date'), DB::raw('COUNT(*) as views'))
            ->where('visited_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pageViews,
        ]);
    }

    /**
     * Get popular pages
     */
    public function getPopularPages(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);
        $days = $request->get('days', 30);
        $startDate = now()->subDays($days);

        $popularPages = DB::table('analytics_page_visits')
            ->select('page', DB::raw('COUNT(*) as views'))
            ->where('visited_at', '>=', $startDate)
            ->groupBy('page')
            ->orderByDesc('views')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $popularPages,
        ]);
    }

    /**
     * Get visitor statistics
     */
    public function getVisitorStats(Request $request): JsonResponse
    {
        $period = $request->get('period', '7d');
        $days = match($period) {
            '24h' => 1,
            '7d' => 7,
            '30d' => 30,
            '90d' => 90,
            default => 7,
        };
        
        $startDate = now()->subDays($days);

        $visitorStats = DB::table('analytics_page_visits')
            ->select(
                DB::raw('DATE(visited_at) as date'),
                DB::raw('COUNT(*) as visitors'),
                DB::raw('COUNT(DISTINCT ip_address) as unique_visitors')
            )
            ->where('visited_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $visitorStats,
        ]);
    }
}

