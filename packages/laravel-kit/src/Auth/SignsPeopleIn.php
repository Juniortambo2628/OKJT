<?php

namespace Okjt\Kit\Auth;

use Illuminate\Database\Eloquent\Model;

/**
 * What every way of signing in hands back. Projects override signedIn() to
 * add what their app needs at sign-in (e.g. the workspaces the person can
 * open), once, in a trait their controllers share.
 */
trait SignsPeopleIn
{
    /** A Sanctum token named okjt.auth.token_name. */
    protected function issueToken(Model $user): string
    {
        return $user->createToken(config('okjt.auth.token_name'))->plainTextToken;
    }

    /** Who signed in, as the app needs it: `user`, plus anything the project adds. */
    protected function signedIn(Model $user): array
    {
        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_superadmin' => (bool) $user->is_superadmin,
            ],
        ];
    }
}
