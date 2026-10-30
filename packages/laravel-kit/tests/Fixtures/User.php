<?php

namespace Okjt\Kit\Tests\Fixtures;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Okjt\Kit\Accounts\HasAccounts;
use Okjt\Kit\Workspace\HasWorkspaceRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasAccounts, HasApiTokens, HasWorkspaceRoles, Notifiable;

    protected $guarded = [];

    protected $casts = ['is_superadmin' => 'boolean', 'email_verified_at' => 'datetime', 'two_factor_confirmed_at' => 'datetime', 'password' => 'hashed'];
}
