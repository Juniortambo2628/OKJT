<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Facades\DB;

class ActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Activity::with('causer')
            ->orderBy('created_at', 'desc');

        // Filter by subject type
        if ($request->has('subject_type')) {
            $query->where('subject_type', $request->subject_type);
        }

        // Filter by causer
        if ($request->has('causer_id')) {
            $query->where('causer_id', $request->causer_id);
        }

        // Filter by event
        if ($request->has('event')) {
            $query->where('event', $request->event);
        }

        // Search in description
        if ($request->has('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        $perPage = $request->get('per_page', 20);
        $activities = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $activities,
        ]);
    }

    public function show($id): JsonResponse
    {
        $activity = Activity::with(['causer', 'subject'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $activity,
        ]);
    }

    public function getStats(): JsonResponse
    {
        $stats = [
            'total' => Activity::count(),
            'today' => Activity::whereDate('created_at', today())->count(),
            'this_week' => Activity::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'this_month' => Activity::whereMonth('created_at', now()->month)->count(),
            'by_event' => Activity::select('event', DB::raw('count(*) as count'))
                ->groupBy('event')
                ->get(),
            'by_subject' => Activity::select('subject_type', DB::raw('count(*) as count'))
                ->groupBy('subject_type')
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}

