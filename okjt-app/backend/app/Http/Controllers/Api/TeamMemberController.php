<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use Illuminate\Http\Request;

class TeamMemberController extends Controller
{
    public function index()
    {
        return response()->json(TeamMember::orderBy('order')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'qualifications' => 'nullable|string|max:255',
            'linkedin' => 'nullable|string|url',
            'image' => 'nullable|string',
            'order' => 'nullable|integer',
        ]);

        $teamMember = TeamMember::create($validated);

        return response()->json($teamMember, 201);
    }

    public function show(TeamMember $teamMember)
    {
        return response()->json($teamMember);
    }

    public function update(Request $request, TeamMember $teamMember)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'qualifications' => 'nullable|string|max:255',
            'linkedin' => 'nullable|string|url',
            'image' => 'nullable|string',
            'order' => 'nullable|integer',
        ]);

        $teamMember->update($validated);

        return response()->json($teamMember);
    }

    public function destroy(TeamMember $teamMember)
    {
        $teamMember->delete();

        return response()->json(null, 204);
    }
}
