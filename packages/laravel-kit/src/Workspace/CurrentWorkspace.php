<?php

namespace Okjt\Kit\Workspace;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;
use Illuminate\Validation\Rules\Unique;

/**
 * The workspace the current request (or job, or command) works on. Set by
 * ResolveWorkspace from the request; every workspace-owned model is scoped to
 * it (see BelongsToWorkspace).
 */
class CurrentWorkspace
{
    private static ?Model $workspace = null;

    public static function get(): ?Model
    {
        return self::$workspace;
    }

    public static function id(): ?int
    {
        return self::$workspace?->getKey();
    }

    public static function set(?Model $workspace): void
    {
        self::$workspace = $workspace;
    }

    /**
     * Run $callback with $workspace as the current one (or none, for
     * platform-wide work like migrations), then restore the previous one.
     */
    public static function run(?Model $workspace, callable $callback): mixed
    {
        $previous = self::$workspace;
        self::$workspace = $workspace;

        try {
            return $callback($workspace);
        } finally {
            self::$workspace = $previous;
        }
    }

    /** The column workspace-owned tables carry (okjt.workspace.foreign_key). */
    public static function column(): string
    {
        return config('okjt.workspace.foreign_key');
    }

    /**
     * Where the current workspace keeps uploads of one kind on the public disk:
     * "{folder}/{id}/{kind}" (plain "{kind}" outside a workspace).
     */
    public static function folder(string $kind): string
    {
        return self::id() ? config('okjt.workspace.folder').'/'.self::id().'/'.$kind : $kind;
    }

    /**
     * Validation rules see raw tables, not scoped models: these limit
     * `exists` / `unique` to the current workspace's rows.
     */
    public static function exists(string $table, string $column = 'id'): Exists
    {
        return Rule::exists($table, $column)->where(self::column(), self::id());
    }

    public static function unique(string $table, string $column, mixed $ignoreId = null): Unique
    {
        return Rule::unique($table, $column)->where(self::column(), self::id())->ignore($ignoreId);
    }
}
