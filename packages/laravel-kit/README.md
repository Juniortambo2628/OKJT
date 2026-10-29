# okjt/laravel-kit

The server half of the OKJT kit, for Laravel 12 APIs: **workspaces** (the
record people work on together — a project, a wedding, a site), **roles** in
each workspace, the middleware that enforces both, and **version history**
with restore.

```bash
composer require okjt/laravel-kit
php artisan vendor:publish --tag=okjt-config
php artisan vendor:publish --tag=okjt-migrations   # new projects: revisions + members table
```

The package is published from the OKJT monorepo to
`Juniortambo2628/okjt-laravel-kit`; until it is on Packagist, add the mirror:

```json
"repositories": { "okjt-laravel-kit": { "type": "vcs", "url": "https://github.com/Juniortambo2628/okjt-laravel-kit" } }
```

## Set it up

`config/okjt.php` names your workspace model and tables (see the file for
every setting):

```php
'workspace' => [
    'model' => App\Models\Project::class,   // implements Okjt\Kit\Workspace\Workspace
    'foreign_key' => 'project_id',          // on every workspace-owned table
    'members_table' => 'project_user',      // project_id, user_id, role
    'header' => 'X-Workspace',              // how the app names the workspace
    'open_routes' => ['api/login', 'api/user', 'api/projects'],
],
'roles' => ['owner' => 'owner', 'viewer' => 'viewer', 'all' => ['owner', 'editor', 'viewer'], 'viewer_writes' => ['api/logout']],
'label' => 'project',                       // used in messages: "This project could not be found."
```

```php
// The workspace model
class Project extends Model implements Workspace
{
    public static function findByKey(?string $key): ?self { return static::where('slug', $key)->first(); }
    public function isActive(): bool { return $this->status === 'active'; }
    public function isPublished(): bool { return true; }
}

// The user model: $user->role (in the current workspace), roleIn(), setRoleIn(), isMemberOf(), isOwner()
class User extends Authenticatable { use HasWorkspaceRoles; }

// Anything that belongs to a workspace: scoped to the current one, created in it, with history
class Expense extends Model
{
    use BelongsToWorkspace, RecordsRevisions;
    protected string $revisionModule = 'expenses';   // the dashboard module it belongs to
}
```

```php
// bootstrap/app.php: pick the workspace before route-model binding
$middleware->api(prepend: [Okjt\Kit\Http\Middleware\ResolveWorkspace::class]);

// routes/api.php
Route::middleware(['auth:sanctum', EnforceRole::class])->group(function () {
    Route::get('/revisions', [RevisionController::class, 'index']);
    Route::post('/revisions/{revision}/restore', [RevisionController::class, 'restore']);
    Route::delete('/project', [ProjectController::class, 'destroy'])->middleware(EnforceRole::class.':owner');
});
Route::middleware(['auth:sanctum', EnsureSuperadmin::class])->prefix('console')->group(/* … */);
```

## What it does

| Piece | Does |
|---|---|
| `ResolveWorkspace` | Makes the workspace the request names current. Unknown → 404; none on a route that needs one → 400; inactive or unpublished → 404 for anyone who isn't one of its people. `reason` in the JSON tells the app which. |
| `CurrentWorkspace` | The current workspace (`get()`, `id()`, `run($workspace, fn)`), its upload folder, and `exists`/`unique` validation rules limited to it. |
| `BelongsToWorkspace` | A global scope (named by `workspace.scope`) so another workspace's rows are "not found", including route-model binding; new rows are created in the current one. |
| `EnforceRole` | Members only; inactive workspaces refused; `:owner` for owners only; viewers may only read, except `roles.viewer_writes`. |
| `EnsureSuperadmin` | `users.is_superadmin` only: platform tools such as a console or backups. |
| `HasWorkspaceRoles` | A person's role per workspace from the members table, cached per request. |
| `RecordsRevisions`, `Revision`, `RevisionController` | Every create/update/delete/restore recorded with before/after; one person's edits to one record within 10 minutes merge; versions kept 180 days (`model:prune`); restore one version or everything saved together. Paused while migrations run. |
| `ApiResponse` | The `{ success, message, data }` envelope the dashboard kit reads. |

When a user is deleted, set their `revisions.user_id` to null and delete
their members rows (the migrations use plain columns, not foreign keys).

## Tests

```bash
composer install && vendor/bin/phpunit
```
