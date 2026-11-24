<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Okjt\Kit\Support\ApiResponse;
use Okjt\Kit\Switches\Switches;

/**
 * The admin's switches screen. Platform-wide, so behind EnsureSuperadmin:
 *
 *   Route::middleware(['auth:sanctum', EnsureSuperadmin::class])->group(function () {
 *       Route::get('/switches', [SwitchController::class, 'index']);
 *       Route::put('/switches/{key}', [SwitchController::class, 'update']);
 *   });
 *
 * Each flip is written to the console audit log (switch.turned_on / _off).
 * Only `public` switches are told to signed-out visitors (publicIndex), for
 * an app whose pages hide a feature while it's off.
 */
class SwitchController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->successResponse(Switches::all());
    }

    public function update(Request $request, string $key): JsonResponse
    {
        abort_unless(array_key_exists($key, Switches::declared()), 404);
        $validated = $request->validate(['on' => 'required|boolean']);
        $before = Switches::on($key);
        $on = (bool) $validated['on'];

        Switches::set($key, $on, $request->user()?->getKey());
        if ($before !== $on) {
            $label = Switches::declared()[$key]['label'] ?? $key;
            config('okjt.console.audit_model')::recordAbout($on ? 'switch.turned_on' : 'switch.turned_off', 'switch', $label, ['key' => $key]);
        }

        $switch = collect(Switches::all())->firstWhere('key', $key);

        return $this->successResponse($switch, $on ? "{$switch['label']}: on" : "{$switch['label']}: off");
    }

    /** key => on for the switches declared `public` => true; nothing else. */
    public function publicIndex(): JsonResponse
    {
        $public = collect(Switches::declared())->filter(fn (array $switch) => $switch['public'] ?? false);

        return $this->successResponse($public->map(fn ($switch, string $key) => Switches::on($key))->all());
    }
}
