<?php

namespace Okjt\Kit\Auth;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;

/**
 * A sign-in code sent by email: only its hash is kept, it works once, and
 * for okjt.auth.login_codes.minutes. Pruned a day after it was made.
 */
class LoginCode extends Model
{
    use Prunable;

    protected $table = 'login_codes';

    protected $fillable = ['user_id', 'code_hash', 'expires_at', 'used_at', 'requested_ip'];

    protected function casts(): array
    {
        return ['expires_at' => 'datetime', 'used_at' => 'datetime'];
    }

    public function isUsable(): bool
    {
        return is_null($this->used_at) && $this->expires_at->isFuture();
    }

    public function prunable(): Builder
    {
        return static::where('created_at', '<', now()->subDay());
    }
}
