<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Stat extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'label',
        'value',
        'description',
        'icon',
        'order',
    ];
}
