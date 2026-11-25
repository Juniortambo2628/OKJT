<?php

namespace Okjt\Kit\Payments\Mpesa;

use RuntimeException;

/** Something a person can be told: a wrong number, M-Pesa off or unreachable. `status` is the HTTP status to answer with. */
class MpesaException extends RuntimeException
{
    public function __construct(string $message, public readonly int $status = 422)
    {
        parent::__construct($message);
    }

    /** Thrown from a project's controller, it answers with its message and status. */
    public function render(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['success' => false, 'message' => $this->getMessage()], $this->status);
    }
}
