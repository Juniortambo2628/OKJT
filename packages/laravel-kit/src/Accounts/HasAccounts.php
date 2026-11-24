<?php

namespace Okjt\Kit\Accounts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/** For the user model: the accounts a person owns or works for. */
trait HasAccounts
{
    public function accounts(): BelongsToMany
    {
        return $this->belongsToMany(config('okjt.accounts.model'), config('okjt.accounts.members_table'), 'user_id', 'account_id')
            ->withPivot('role')
            ->withTimestamps();
    }

    /** The first account this person owns. */
    public function ownedAccount(): ?Model
    {
        return $this->accounts()->wherePivot('role', config('okjt.accounts.owner_role'))->orderBy($this->accounts()->getRelated()->getQualifiedKeyName())->first();
    }
}
