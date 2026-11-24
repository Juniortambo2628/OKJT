<?php

namespace Okjt\Kit\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

/**
 * The kit's JSON envelope: { success, message, data? | errors? }. The
 * dashboard kit's API calls read responses in this shape.
 */
trait ApiResponse
{
    protected function successResponse(mixed $data = null, string $message = 'Success', int $code = 200): JsonResponse
    {
        $response = ['success' => true, 'message' => $message];
        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $code);
    }

    protected function createdResponse(mixed $data = null, string $message = 'Created successfully'): JsonResponse
    {
        return $this->successResponse($data, $message, 201);
    }

    protected function deletedResponse(string $message = 'Deleted successfully'): JsonResponse
    {
        return response()->json(['success' => true, 'message' => $message], 200);
    }

    protected function noContentResponse(string $message = 'Deleted successfully'): JsonResponse
    {
        return response()->json(null, 204);
    }

    protected function errorResponse(string $message = 'An error occurred', int $code = 400, mixed $errors = null): JsonResponse
    {
        $response = ['success' => false, 'message' => $message];
        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    protected function unauthorizedResponse(string $message = 'Unauthenticated'): JsonResponse
    {
        return $this->errorResponse($message, 401);
    }

    protected function forbiddenResponse(string $message = 'Forbidden'): JsonResponse
    {
        return $this->errorResponse($message, 403);
    }

    protected function notFoundResponse(string $message = 'Not found'): JsonResponse
    {
        return $this->errorResponse($message, 404);
    }

    protected function validationErrorResponse(ValidationException $e): JsonResponse
    {
        return $this->errorResponse('Validation failed', 422, $e->errors());
    }
}
