<?php

namespace Okjt\Kit\Tests\Fixtures;

use Illuminate\Database\Eloquent\Model;
use Okjt\Kit\Accounts\HasTeam;

class Account extends Model
{
    use HasTeam;

    protected $guarded = [];
}
