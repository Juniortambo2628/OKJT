<?php

namespace Okjt\Kit\Billing;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/** Something the account's plan doesn't allow; the app shows `message` and can offer an upgrade (`reason: plan_limit`). */
class PlanLimitReached extends RuntimeException
{
    public function __construct(public readonly string $limit, public readonly int $max)
    {
        $what = Settings::get("limit_names.$limit", $limit);
        $template = config(Plans::billingEnabled() ? 'okjt.messages.plan_limit' : 'okjt.messages.trial_limit');
        parent::__construct(str_replace([':max', ':limit'], [$max, $what], (string) $template));
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'reason' => 'plan_limit',
            'limit' => $this->limit,
            'max' => $this->max,
        ], 422);
    }
}
