<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;

/** One run of the website health check; its report has a shareable address for 30 days. */
class SiteCheck extends Model
{
    use HasUlids, MassPrunable;

    public const KEEP_DAYS = 30;

    protected $fillable = ['url', 'host', 'report', 'speed'];

    protected $casts = ['report' => 'array', 'speed' => 'array'];

    public function prunable(): Builder
    {
        return static::where('created_at', '<', now()->subDays(self::KEEP_DAYS));
    }

    public function scopeCurrent(Builder $query): Builder
    {
        return $query->where('created_at', '>=', now()->subDays(self::KEEP_DAYS));
    }
}
