<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use App\Models\PortfolioProject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|max:255',
            'type' => 'nullable|string|in:all,portfolio,submissions',
        ]);

        $query = $request->input('q');
        $type = $request->input('type', 'all');

        $results = [];

        if ($type === 'all' || $type === 'portfolio') {
            $portfolio = PortfolioProject::search($query)->take(10)->get()->map(function (PortfolioProject $project) {
                return [
                    'type' => 'portfolio',
                    'id' => $project->id,
                    'title' => $project->title,
                    'subtitle' => $project->client_name,
                    'status' => $project->status,
                    'category' => $project->category,
                    'featured' => (bool) $project->featured,
                ];
            });

            $results = array_merge($results, $portfolio->toArray());
        }

        if ($type === 'all' || $type === 'submissions') {
            $submissions = ContactSubmission::search($query)->take(10)->get()->map(function (ContactSubmission $submission) {
                return [
                    'type' => 'submission',
                    'id' => $submission->id,
                    'title' => $submission->name,
                    'subtitle' => $submission->email,
                    'status' => $submission->status,
                    'contact_method' => $submission->contact_method,
                ];
            });

            $results = array_merge($results, $submissions->toArray());
        }

        return response()->json([
            'success' => true,
            'data' => $results,
        ]);
    }
}


