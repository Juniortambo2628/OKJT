<?php

namespace Okjt\Kit\Tests\Fixtures;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Okjt\Kit\Workspace\HasWorkspaceRoles;

class User extends Authenticatable
{
    use HasWorkspaceRoles;

    protected $guarded = [];

    protected $casts = ['is_superadmin' => 'boolean'];
}
