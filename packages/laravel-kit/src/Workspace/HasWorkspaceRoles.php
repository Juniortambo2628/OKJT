<?php

namespace Okjt\Kit\Workspace;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * For the user model: a person's role in each workspace, from the members
 * table (okjt.workspace.members_table: workspace column, user_id, role).
 *
 * `$user->role` is their role in the current workspace, or null when they
 * have no access to it; outside a workspace (e.g. signing in) it is the
 * account-wide value stored on the user.
 */
trait HasWorkspaceRoles
{
    /** Roles looked up per workspace during this request. */
    private array $rolesByWorkspace = [];

    protected function role(): Attribute
    {
        return Attribute::get(fn ($value) => ($id = CurrentWorkspace::id()) ? $this->roleIn($id) : $value);
    }

    public function roleIn(Model|int $workspace): ?string
    {
        $id = $workspace instanceof Model ? $workspace->getKey() : $workspace;

        return $this->rolesByWorkspace[$id] ??= DB::table(config('okjt.workspace.members_table'))
            ->where(CurrentWorkspace::column(), $id)->where('user_id', $this->getKey())->value('role');
    }

    /** Give this person $role in $workspace (adding them if needed). */
    public function setRoleIn(Model|int $workspace, string $role): void
    {
        $id = $workspace instanceof Model ? $workspace->getKey() : $workspace;

        DB::table(config('okjt.workspace.members_table'))->updateOrInsert(
            [CurrentWorkspace::column() => $id, 'user_id' => $this->getKey()],
            ['role' => $role, 'updated_at' => now(), 'created_at' => now()],
        );

        $this->rolesByWorkspace[$id] = $role;
    }

    public function isMemberOf(Model|int $workspace): bool
    {
        return $this->roleIn($workspace) !== null;
    }

    /** Whether they own the current workspace. */
    public function isOwner(): bool
    {
        return $this->role === config('okjt.roles.owner');
    }
}
