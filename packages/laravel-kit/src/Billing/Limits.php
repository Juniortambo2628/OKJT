<?php

namespace Okjt\Kit\Billing;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Okjt\Kit\Workspace\CurrentWorkspace;

/**
 * Checks before adding something a plan counts. The kit counts `workspaces`
 * (per account) and `collaborators` (per workspace); a project extends this
 * class for its own (guests, products…), overriding used(), and names it in
 * okjt.billing.limits. Nothing already there is ever removed.
 */
class Limits
{
    /** Throws PlanLimitReached if adding $adding more would pass the limit. */
    public static function ensure(string $limit, int $adding = 1, ?Model $account = null): void
    {
        $account ??= static::accountOf(CurrentWorkspace::get());
        if (! $account) {
            return;
        }
        $max = Plans::limit($account, $limit);
        if ($max !== null && static::used($limit, $account) + $adding > $max) {
            throw new PlanLimitReached($limit, $max);
        }
    }

    /** How many the account (or $workspace, default the current one) has. */
    public static function used(string $limit, Model $account, ?Model $workspace = null): int
    {
        $workspace ??= CurrentWorkspace::get();

        return match ($limit) {
            'workspaces' => $account->workspaces()->count(),
            'collaborators' => $workspace ? DB::table(config('okjt.workspace.members_table'))->where(config('okjt.workspace.foreign_key'), $workspace->id)->count() : 0,
            default => 0,
        };
    }

    public static function accountOf(?Model $workspace): ?Model
    {
        $id = $workspace?->{config('okjt.accounts.foreign_key')};

        return $id ? config('okjt.accounts.model')::find($id) : null;
    }
}
