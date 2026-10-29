<?php

namespace Okjt\Kit\Workspace;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A row that belongs to one workspace. While a workspace is current (every API
 * request that names one), queries only see that workspace's rows — including
 * route-model binding, so another workspace's id is simply "not found" — and
 * new rows are created in it.
 */
trait BelongsToWorkspace
{
    public static function bootBelongsToWorkspace(): void
    {
        static::addGlobalScope(config('okjt.workspace.scope', 'workspace'), function (Builder $query) {
            if ($id = CurrentWorkspace::id()) {
                $query->where($query->getModel()->qualifyColumn(CurrentWorkspace::column()), $id);
            }
        });

        static::creating(function ($model) {
            $column = CurrentWorkspace::column();
            if (empty($model->{$column}) && ($id = CurrentWorkspace::id())) {
                $model->{$column} = $id;
            }
        });
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(config('okjt.workspace.model'), CurrentWorkspace::column());
    }
}
