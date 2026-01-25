<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\ContactSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * List comments for a contact submission.
     */
    public function forSubmission(int $submissionId): JsonResponse
    {
        $submission = ContactSubmission::find($submissionId);

        if (! $submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found',
            ], 404);
        }

        $comments = $submission->comments()
            ->with('user:id,name,email')
            ->get()
            ->map(function (Comment $comment) {
                return [
                    'id' => $comment->id,
                    'body' => $comment->body,
                    'author_name' => $comment->author_name ?? $comment->user?->name,
                    'author_email' => $comment->author_email ?? $comment->user?->email,
                    'created_by' => $comment->created_by,
                    'created_at' => $comment->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $comments,
        ]);
    }

    /**
     * Store a new comment for a contact submission.
     */
    public function storeForSubmission(Request $request, int $submissionId): JsonResponse
    {
        $submission = ContactSubmission::find($submissionId);

        if (! $submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found',
            ], 404);
        }

        $validated = $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $user = $request->user();

        $comment = $submission->comments()->create([
            'body' => $validated['body'],
            'author_name' => $user?->name,
            'author_email' => $user?->email,
            'created_by' => $user?->id,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $comment->id,
                'body' => $comment->body,
                'author_name' => $comment->author_name,
                'author_email' => $comment->author_email,
                'created_by' => $comment->created_by,
                'created_at' => $comment->created_at,
            ],
            'message' => 'Comment added successfully',
        ], 201);
    }

    /**
     * Delete a comment.
     */
    public function destroy(int $id): JsonResponse
    {
        $comment = Comment::find($id);

        if (! $comment) {
            return response()->json([
                'success' => false,
                'message' => 'Comment not found',
            ], 404);
        }

        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comment deleted successfully',
        ]);
    }
}


