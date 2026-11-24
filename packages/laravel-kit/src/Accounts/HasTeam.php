<?php

namespace Okjt\Kit\Accounts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * For the account model (okjt.accounts.model): an account owns workspaces,
 * and its people are owners or staff. Staff on "all" workspaces join new
 * ones as they come (call shareWithTeam when one is created).
 */
trait HasTeam
{
    public function members(): BelongsToMany
    {
        $fields = config('okjt.accounts.fields');

        return $this->belongsToMany(config('okjt.user_model'), config('okjt.accounts.members_table'), 'account_id', 'user_id')
            ->withPivot(['role', $fields['all'], $fields['role']])
            ->withTimestamps();
    }

    public function workspaces(): HasMany
    {
        return $this->hasMany(config('okjt.workspace.model'), config('okjt.accounts.foreign_key'));
    }

    /** The account's staff, as members with their pivot settings. */
    public function staff(): BelongsToMany
    {
        return $this->members()->wherePivot('role', config('okjt.accounts.staff_role'));
    }

    /** Give the account's "all workspaces" staff access to $workspace (a new one, or after joining), each with their role. */
    public function shareWithTeam(Model $workspace): void
    {
        $fields = config('okjt.accounts.fields');

        foreach ($this->staff()->wherePivot($fields['all'], true)->get() as $staff) {
            if (! $staff->isMemberOf($workspace)) {
                $staff->setRoleIn($workspace, $staff->pivot->{$fields['role']});
            }
        }
    }
}
