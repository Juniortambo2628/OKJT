<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Okjt\Kit\Payments\Mpesa\Mpesa;
use Okjt\Kit\Payments\Mpesa\MpesaPayment;
use Okjt\Kit\Support\ApiResponse;

/**
 * M-Pesa's answers, and a prompt's progress for @okjt/dashboard's StkPrompt.
 * Starting a prompt is the project's own endpoint (it knows what is being
 * paid for and how much), calling Mpesa::start():
 *
 *   Route::post('/mpesa/callback/{token}', [MpesaController::class, 'callback'])->middleware('throttle:120,1');
 *   Route::middleware('auth:sanctum')->get('/mpesa/payments/{id}', [MpesaController::class, 'show']);
 *
 * The callback address must match okjt.mpesa.callback_path, sit outside any
 * auth or CSRF check, and is answered the same whatever comes in. It still
 * records answers while M-Pesa is switched off: a prompt sent before the
 * switch was turned off may have moved money.
 */
class MpesaController extends Controller
{
    use ApiResponse;

    public function callback(Request $request, Mpesa $mpesa, string $token): JsonResponse
    {
        $mpesa->callback($token, $request->all());

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }

    /** A prompt's progress, for whoever sent it (or a superadmin). */
    public function show(Request $request, string $id): JsonResponse
    {
        $payment = MpesaPayment::find($id);
        $user = $request->user();
        abort_unless($payment && $user && ((string) $payment->requested_by === (string) $user->getKey() || $user->is_superadmin), 404);

        return $this->successResponse($payment->present());
    }
}
