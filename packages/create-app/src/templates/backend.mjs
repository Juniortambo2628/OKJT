/**
 * The Laravel API: files written over a fresh `laravel/laravel` install, as
 * path → contents. `p` is the project (answers.mjs › describeProject).
 */

const lines = (...parts) => parts.filter((part) => part !== false && part != null).join('\n');
const q = (text) => `'${String(text).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

export function backendFiles(p) {
  const files = {
    'config/okjt.php': okjtConfig(p),
    'bootstrap/app.php': bootstrap(),
    'routes/api.php': apiRoutes(p),
    'routes/web.php': webRoutes(p),
    'app/Models/User.php': userModel(p),
    [`app/Models/${p.workspace.Model}.php`]: workspaceModel(p),
    'app/Models/Note.php': noteModel(),
    'app/Notifications/VerifyEmailAddress.php': verifyEmailNotification(),
    'app/Http/Controllers/Api/AuthController.php': authController(p),
    [`app/Http/Controllers/Api/${p.workspace.Model}Controller.php`]: workspaceController(p),
    'app/Http/Controllers/Api/NoteController.php': noteController(),
    'database/migrations/2026_01_01_100000_add_okjt_columns_to_users.php': usersMigration(),
    [`database/migrations/2026_01_01_100001_create_${p.workspace.table}_table.php`]: workspaceMigration(p),
    'database/migrations/2026_01_01_100002_create_notes_table.php': notesMigration(p),
    'database/migrations/2026_01_01_100003_create_notifications_table.php': notificationsMigration(p),
    'database/seeders/DatabaseSeeder.php': seeder(p),
    'tests/Feature/StarterTest.php': starterTest(p),
  };
  if (p.accounts) files['app/Models/Account.php'] = accountModel(p);
  return files;
}

/** Project settings over the kit's (its file is the full, commented list). */
function okjtConfig(p) {
  const w = p.workspace;
  const open = [
    'api/login', 'api/logout', 'api/register', 'api/user', 'api/verify-2fa', 'api/email/*', 'api/2fa/*',
    'api/collaborators/accept', `api/${w.path}`,
    p.features.google && 'api/auth/google',
    p.accounts && 'api/team', p.accounts && 'api/team/*',
    p.features.billing && 'api/plans', p.features.billing && 'api/billing', p.features.billing && 'api/billing/*', p.features.billing && 'api/paystack/webhook',
    p.features.console && 'api/console/*',
    p.features.backups && 'api/backups', p.features.backups && 'api/backups/*',
  ].filter(Boolean);
  const roles = p.roles.map((r) => r.value);

  return lines(
    '<?php',
    '',
    '/*',
    ` * ${p.name}'s settings for the OKJT kit (okjt/laravel-kit). Only what differs`,
    ' * from the kit is here; everything else, and what each setting means, is in',
    ' * vendor/okjt/laravel-kit/config/okjt.php. Lists are replaced whole.',
    ' */',
    "$kit = require base_path('vendor/okjt/laravel-kit/config/okjt.php');",
    '',
    '$config = array_replace_recursive($kit, [',
    "    'workspace' => [",
    `        'model' => App\\Models\\${w.Model}::class,`,
    `        'foreign_key' => ${q(w.foreignKey)},`,
    `        'members_table' => ${q(w.members)},`,
    `        'folder' => ${q(w.table)},`,
    '    ],',
    `    'label' => ${q(w.label)},`,
    "    'auth' => [",
    `        'token_name' => ${q(p.slug)},`,
    `        'welcome' => ${q(`Welcome to ${p.name} — check your inbox to verify your email.`)},`,
    '    ],',
    "    'collaboration' => [",
    `        'token_name' => ${q(p.slug)},`,
    `        'default_role' => ${q(p.preset === 'simple' ? 'viewer' : 'editor')},`,
    "        'badge_modules' => ['notes'],",
    '    ],',
    p.accounts && lines(
      "    'accounts' => [",
      "        'model' => App\\Models\\Account::class,",
      `        'foreign_key' => 'account_id',`,
      '    ],',
    ),
    p.features.billing && lines(
      "    'billing' => [",
      `        'reference_prefix' => ${q(`${p.slug.replace(/-/g, '_')}_`)},`,
      `        'limit_names' => ['workspaces' => ${q(w.plural)}, 'collaborators' => 'people'],`,
      '    ],',
    ),
    ']);',
    '',
    `$config['workspace']['open_routes'] = [`,
    ...open.map((route) => `    ${q(route)},`),
    '];',
    `$config['roles']['all'] = [${roles.map(q).join(', ')}];`,
    "$config['roles']['viewer_writes'] = ['api/logout', 'api/collaboration/heartbeat', 'api/2fa/*', 'api/notifications/mark-read'];",
    p.features.billing && lines(
      '',
      '// Placeholder plans: set real prices before switching BILLING_ENABLED on.',
      "$config['billing']['trial_limits'] = ['workspaces' => 3, 'collaborators' => 3];",
      "$config['billing']['plans'] = [",
      "    'free' => ['name' => 'Free', 'for' => [], 'price' => null, 'period' => null, 'limits' => ['workspaces' => 1, 'collaborators' => 3]],",
      "    'pro' => ['name' => 'Pro', 'for' => [], 'price' => 2500, 'period' => 1, 'limits' => ['workspaces' => 20, 'collaborators' => 20]],",
      '];',
    ),
    '',
    'return $config;',
    '',
  );
}

function bootstrap() {
  return `<?php

use Illuminate\\Auth\\AuthenticationException;
use Illuminate\\Foundation\\Application;
use Illuminate\\Foundation\\Configuration\\Exceptions;
use Illuminate\\Foundation\\Configuration\\Middleware;
use Illuminate\\Http\\Request;
use Okjt\\Kit\\Http\\Middleware\\ResolveWorkspace;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Before route-model binding, so bound records are already scoped to the workspace.
        $middleware->api(prepend: [ResolveWorkspace::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
        });
    })->create();
`;
}

function apiRoutes(p) {
  const w = p.workspace;
  const use = [
    `App\\Http\\Controllers\\Api\\AuthController`,
    `App\\Http\\Controllers\\Api\\NoteController`,
    `App\\Http\\Controllers\\Api\\${w.Model}Controller`,
    'Illuminate\\Support\\Facades\\Route',
    p.features.backups && 'Okjt\\Kit\\Http\\Controllers\\BackupController',
    p.features.billing && 'Okjt\\Kit\\Http\\Controllers\\BillingController',
    'Okjt\\Kit\\Http\\Controllers\\CollaborationController',
    p.features.console && 'Okjt\\Kit\\Http\\Controllers\\ConsoleController',
    'Okjt\\Kit\\Http\\Controllers\\EmailVerificationController',
    'Okjt\\Kit\\Http\\Controllers\\NotificationController',
    'Okjt\\Kit\\Http\\Controllers\\RevisionController',
    p.features.google && 'Okjt\\Kit\\Http\\Controllers\\SocialAuthController',
    p.accounts && 'Okjt\\Kit\\Http\\Controllers\\TeamController',
    'Okjt\\Kit\\Http\\Controllers\\TwoFactorController',
    'Okjt\\Kit\\Http\\Middleware\\EnforceRole',
    p.platform && (p.features.console || p.features.backups) && 'Okjt\\Kit\\Http\\Middleware\\EnsureSuperadmin',
  ].filter(Boolean).sort((a, b) => a.localeCompare(b));

  return lines(
    '<?php',
    '',
    ...use.map((c) => `use ${c};`),
    '',
    '/*',
    ' * Without a workspace (see open_routes in config/okjt.php): signing in and',
    ` * up, your account, your ${w.plural}${p.accounts ? ', your team' : ''}${p.features.billing ? ', billing' : ''}${p.features.console ? ', the console' : ''}.`,
    ` * Everything else works on the ${w.label} the request names (X-Workspace).`,
    ' */',
    "Route::middleware('throttle:15,1')->group(function () {",
    "    Route::post('/login', [AuthController::class, 'login']);",
    "    Route::post('/verify-2fa', [AuthController::class, 'verify2fa']);",
    "    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1,register');",
    "    Route::post('/email/verify', [EmailVerificationController::class, 'verify']);",
    "    Route::post('/email/resend', [EmailVerificationController::class, 'resend']);",
    "    Route::post('/collaborators/accept', [CollaborationController::class, 'accept']);",
    p.features.google && "    Route::post('/auth/google', [SocialAuthController::class, 'login']);",
    '});',
    p.features.billing && lines(
      '',
      "Route::get('/plans', [BillingController::class, 'plans']);",
      "Route::post('/paystack/webhook', [BillingController::class, 'webhook']);",
    ),
    '',
    "Route::middleware(['auth:sanctum', EnforceRole::class])->group(function () {",
    "    Route::post('/logout', [AuthController::class, 'logout']);",
    "    Route::get('/user', [AuthController::class, 'user']);",
    "    Route::post('/2fa/setup', [TwoFactorController::class, 'setup']);",
    "    Route::post('/2fa/confirm', [TwoFactorController::class, 'confirm']);",
    "    Route::post('/2fa/disable', [TwoFactorController::class, 'disable']);",
    '',
    `    Route::get('/${w.path}', [${w.Model}Controller::class, 'index']);`,
    `    Route::post('/${w.path}', [${w.Model}Controller::class, 'store'])->middleware('throttle:10,1,new-workspace');`,
    p.accounts && lines(
      '',
      "    Route::get('/team', [TeamController::class, 'index']);",
      "    Route::post('/team', [TeamController::class, 'invite'])->middleware('throttle:20,1,team');",
      "    Route::put('/team/{user}', [TeamController::class, 'update']);",
      "    Route::delete('/team/{user}', [TeamController::class, 'destroy']);",
    ),
    p.features.billing && lines(
      '',
      "    Route::get('/billing', [BillingController::class, 'show']);",
      "    Route::post('/billing/checkout', [BillingController::class, 'checkout'])->middleware('throttle:10,1,checkout');",
      "    Route::get('/billing/verify', [BillingController::class, 'verify']);",
    ),
    '',
    `    // Inside a ${w.label}: working together, version history, the bell, and its notes.`,
    "    Route::post('/collaboration/heartbeat', [CollaborationController::class, 'heartbeat']);",
    "    Route::get('/collaborators', [CollaborationController::class, 'collaborators']);",
    "    Route::middleware(EnforceRole::class.':owner')->group(function () {",
    "        Route::post('/collaborators/invite', [CollaborationController::class, 'invite']);",
    "        Route::patch('/collaborators/{user}/role', [CollaborationController::class, 'updateRole']);",
    "        Route::delete('/collaborators/{user}', [CollaborationController::class, 'remove']);",
    '    });',
    "    Route::get('/revisions', [RevisionController::class, 'index']);",
    "    Route::post('/revisions/{revision}/restore', [RevisionController::class, 'restore']);",
    "    Route::get('/notifications', [NotificationController::class, 'index']);",
    "    Route::post('/notifications/mark-read', [NotificationController::class, 'markAllRead']);",
    '',
    "    Route::get('/notes', [NoteController::class, 'index']);",
    "    Route::post('/notes', [NoteController::class, 'store']);",
    "    Route::put('/notes/{note}', [NoteController::class, 'update']);",
    "    Route::delete('/notes/{note}', [NoteController::class, 'destroy']);",
    p.features.console && lines(
      '',
      "    Route::prefix('console')->middleware(EnsureSuperadmin::class)->group(function () {",
      "        Route::get('/workspaces', [ConsoleController::class, 'workspaces']);",
      "        Route::patch('/workspaces/{workspace}/status', [ConsoleController::class, 'setStatus']);",
      "        Route::delete('/workspaces/{workspace}', [ConsoleController::class, 'destroyWorkspace']);",
      "        Route::get('/audit', [ConsoleController::class, 'audit']);",
      '    });',
    ),
    p.features.backups && lines(
      '',
      "    Route::prefix('backups')->middleware(EnsureSuperadmin::class)->group(function () {",
      "        Route::get('/', [BackupController::class, 'index']);",
      "        Route::post('/', [BackupController::class, 'store']);",
      "        Route::get('/{name}/download', [BackupController::class, 'download']);",
      "        Route::post('/{name}/restore', [BackupController::class, 'restore']);",
      "        Route::post('/{name}/verify', [BackupController::class, 'verify']);",
      "        Route::delete('/{name}', [BackupController::class, 'destroy']);",
      '    });',
    ),
    '});',
    '',
  );
}

function webRoutes(p) {
  const web = p.features.google || p.features.passkeys;
  return lines(
    '<?php',
    '',
    p.features.passkeys && 'use Okjt\\Kit\\Http\\Controllers\\PasskeyController;',
    p.features.google && 'use Okjt\\Kit\\Http\\Controllers\\SocialAuthController;',
    'use Illuminate\\Support\\Facades\\Route;',
    '',
    web && '// Passkey challenges and Google\'s OAuth state ride the session, so these are web routes.',
    p.features.passkeys && lines(
      "Route::prefix('api')->middleware(['web', 'throttle:6,1'])->group(function () {",
      "    Route::get('/passkeys/login/options', [PasskeyController::class, 'loginOptions']);",
      "    Route::post('/passkeys/login', [PasskeyController::class, 'login']);",
      "    Route::get('/passkeys/options', [PasskeyController::class, 'registerOptions'])->middleware('auth:sanctum');",
      "    Route::get('/passkeys', [PasskeyController::class, 'index'])->middleware('auth:sanctum');",
      "    Route::post('/passkeys', [PasskeyController::class, 'register'])->middleware('auth:sanctum');",
      "    Route::delete('/passkeys/{id}', [PasskeyController::class, 'destroy'])->middleware('auth:sanctum');",
      '});',
      '',
    ),
    p.features.google && lines(
      "Route::prefix('api')->middleware(['web', 'throttle:20,1'])->group(function () {",
      "    Route::get('/auth/google', [SocialAuthController::class, 'redirect']);",
      "    Route::get('/auth/google/callback', [SocialAuthController::class, 'callback']);",
      '});',
      '',
    ),
    '// The React app (built into public/ when deployed) answers every other page.',
    "Route::get('/{any?}', function () {",
    "    $index = public_path('index.html');",
    '',
    "    return file_exists($index) ? response()->file($index) : response('Run the frontend: cd frontend && npm run dev', 200);",
    "})->where('any', '^(?!api|up|storage|assets).*$');",
    '',
    '// Where Laravel sends people it can\'t authenticate (the API answers 401 instead).',
    "Route::get('/login', fn () => response()->json(['message' => 'Unauthenticated.'], 401))->name('login');",
    '',
  );
}

function userModel(p) {
  const passkeys = p.features.passkeys;
  return lines(
    '<?php',
    '',
    'namespace App\\Models;',
    '',
    'use App\\Notifications\\VerifyEmailAddress;',
    'use Illuminate\\Contracts\\Auth\\MustVerifyEmail;',
    'use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;',
    'use Illuminate\\Foundation\\Auth\\User as Authenticatable;',
    'use Illuminate\\Notifications\\Notifiable;',
    passkeys && 'use Laravel\\Passkeys\\Contracts\\PasskeyUser;',
    passkeys && 'use Laravel\\Passkeys\\PasskeyAuthenticatable;',
    'use Laravel\\Sanctum\\HasApiTokens;',
    p.accounts && 'use Okjt\\Kit\\Accounts\\HasAccounts;',
    'use Okjt\\Kit\\Workspace\\HasWorkspaceRoles;',
    '',
    '/**',
    ` * Someone who signs in to ${p.name}. Their role is per ${p.workspace.label}`,
    ` * (HasWorkspaceRoles: \`role\` is their role in the current one)${p.accounts ? ', and they own or work for accounts (HasAccounts)' : ''}.`,
    p.platform && ' * `is_superadmin` marks the people who run the platform.',
    ' */',
    `class User extends Authenticatable implements MustVerifyEmail${passkeys ? ', PasskeyUser' : ''}`,
    '{',
    `    use ${[p.accounts && 'HasAccounts', 'HasApiTokens', 'HasFactory', 'HasWorkspaceRoles', 'Notifiable', passkeys && 'PasskeyAuthenticatable'].filter(Boolean).join(', ')};`,
    '',
    "    protected $fillable = ['name', 'email', 'password', 'role'];",
    '',
    "    protected $hidden = ['password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes'];",
    '',
    '    protected function casts(): array',
    '    {',
    '        return [',
    "            'email_verified_at' => 'datetime',",
    "            'password' => 'hashed',",
    "            'is_superadmin' => 'boolean',",
    "            'two_factor_confirmed_at' => 'datetime',",
    "            'last_active_at' => 'datetime',",
    "            'invite_accepted_at' => 'datetime',",
    '        ];',
    '    }',
    '',
    '    /** The verification email links to the app\'s /verify-email page. */',
    '    public function sendEmailVerificationNotification(): void',
    '    {',
    '        $this->notify(new VerifyEmailAddress);',
    '    }',
    '}',
    '',
  );
}

function workspaceModel(p) {
  const w = p.workspace;
  return lines(
    '<?php',
    '',
    'namespace App\\Models;',
    '',
    'use Illuminate\\Database\\Eloquent\\Model;',
    p.accounts && 'use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;',
    'use Okjt\\Kit\\Workspace\\Workspace;',
    '',
    `/** A ${w.label}: what people work on together (the kit's workspace). Requests name it by its slug. */`,
    `class ${w.Model} extends Model implements Workspace`,
    '{',
    `    protected $fillable = ['name', 'slug', 'status'${p.accounts ? ", 'account_id'" : ''}];`,
    '',
    '    public static function findByKey(?string $key): ?self',
    '    {',
    "        return $key ? static::where('slug', $key)->first() : null;",
    '    }',
    '',
    '    public function isActive(): bool',
    '    {',
    "        return $this->status === 'active';",
    '    }',
    '',
    `    /** ${w.plural} have no public pages, so there's nothing to publish. */`,
    '    public function isPublished(): bool',
    '    {',
    '        return true;',
    '    }',
    p.accounts && lines(
      '',
      '    public function account(): BelongsTo',
      '    {',
      '        return $this->belongsTo(Account::class);',
      '    }',
    ),
    '}',
    '',
  );
}

function accountModel(p) {
  return lines(
    '<?php',
    '',
    'namespace App\\Models;',
    '',
    'use Illuminate\\Database\\Eloquent\\Model;',
    'use Okjt\\Kit\\Accounts\\HasTeam;',
    '',
    `/** A customer: owns ${p.workspace.plural}; its people are owners or staff (HasTeam)${p.features.billing ? ', and it has a plan' : ''}. */`,
    'class Account extends Model',
    '{',
    '    use HasTeam;',
    '',
    `    protected $fillable = ['name'${p.features.billing ? ", 'plan', 'plan_expires_at'" : ''}];`,
    p.features.billing && lines(
      '',
      '    protected function casts(): array',
      '    {',
      "        return ['plan_expires_at' => 'datetime'];",
      '    }',
    ),
    '}',
    '',
  );
}

function noteModel() {
  return `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Okjt\\Kit\\Revisions\\RecordsRevisions;
use Okjt\\Kit\\Workspace\\BelongsToWorkspace;

/**
 * The starter module: notes in a workspace. Copy it for your own: scoped to
 * the current workspace (BelongsToWorkspace), every change kept in version
 * history (RecordsRevisions), under the dashboard module "notes".
 */
class Note extends Model
{
    use BelongsToWorkspace, RecordsRevisions;

    protected string $revisionModule = 'notes';

    protected $fillable = ['title', 'body'];
}
`;
}

function authController(p) {
  return lines(
    '<?php',
    '',
    'namespace App\\Http\\Controllers\\Api;',
    '',
    p.accounts && 'use App\\Models\\Account;',
    p.accounts && 'use Illuminate\\Database\\Eloquent\\Model;',
    'use Okjt\\Kit\\Http\\Controllers\\AuthController as KitAuthController;',
    '',
    '/**',
    ' * Signing in, two-step codes, signing up, signing out and who you are: the',
    ` * OKJT kit's.${p.accounts ? ' Signing up also makes your account, which you own.' : ''}`,
    ' */',
    'class AuthController extends KitAuthController',
    '{',
    p.accounts && lines(
      '    protected function registered(Model $user, array $validated): array',
      '    {',
      "        $account = Account::create(['name' => $user->name]);",
      "        $account->members()->attach($user->id, ['role' => config('okjt.accounts.owner_role')]);",
      '',
      "        return ['account' => ['id' => $account->id, 'name' => $account->name]];",
      '    }',
    ),
    '}',
    '',
  );
}

function workspaceController(p) {
  const w = p.workspace;
  return lines(
    '<?php',
    '',
    'namespace App\\Http\\Controllers\\Api;',
    '',
    `use App\\Models\\${w.Model};`,
    'use Illuminate\\Http\\JsonResponse;',
    'use Illuminate\\Http\\Request;',
    'use Illuminate\\Routing\\Controller;',
    'use Illuminate\\Support\\Facades\\DB;',
    'use Illuminate\\Support\\Str;',
    p.features.billing && 'use Okjt\\Kit\\Billing\\Limits;',
    'use Okjt\\Kit\\Support\\ApiResponse;',
    '',
    `/** Your ${w.plural}: the ones you can open (with your role), and starting a new one. */`,
    `class ${w.Model}Controller extends Controller`,
    '{',
    '    use ApiResponse;',
    '',
    '    public function index(Request $request): JsonResponse',
    '    {',
    `        $rows = DB::table(${q(w.members)})`,
    `            ->join(${q(w.table)}, ${q(`${w.table}.id`)}, '=', ${q(`${w.members}.${w.foreignKey}`)})`,
    `            ->where(${q(`${w.members}.user_id`)}, $request->user()->id)`,
    `            ->orderBy(${q(`${w.table}.name`)})`,
    `            ->get([${q(`${w.table}.id`)}, ${q(`${w.table}.name`)}, ${q(`${w.table}.slug`)}, ${q(`${w.table}.status`)}, ${q(`${w.members}.role`)}]);`,
    '',
    '        return $this->successResponse($rows);',
    '    }',
    '',
    '    public function store(Request $request): JsonResponse',
    '    {',
    "        $validated = $request->validate(['name' => 'required|string|max:120']);",
    p.accounts && lines(
      '        $account = $request->user()->ownedAccount();',
      '        if (! $account) {',
      `            return $this->forbiddenResponse(${q(`Only an account's owners start new ${w.plural}.`)});`,
      '        }',
      p.features.billing && "        Limits::ensure('workspaces', 1, $account);",
    ),
    '',
    "        $slug = Str::slug($validated['name']) ?: Str::lower(Str::random(8));",
    `        while (${w.Model}::where('slug', $slug)->exists()) {`,
    "            $slug = Str::slug($validated['name']).'-'.Str::lower(Str::random(4));",
    '        }',
    '',
    `        $workspace = ${w.Model}::create(['name' => $validated['name'], 'slug' => $slug, 'status' => 'active'${p.accounts ? ", 'account_id' => $account->id" : ''}]);`,
    "        $request->user()->setRoleIn($workspace, config('okjt.roles.owner'));",
    p.accounts && '        $account->shareWithTeam($workspace);',
    '',
    "        return $this->createdResponse($workspace->only(['id', 'name', 'slug', 'status']) + ['role' => config('okjt.roles.owner')]);",
    '    }',
    '}',
    '',
  );
}

function noteController() {
  return `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Models\\Note;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;
use Illuminate\\Routing\\Controller;
use Okjt\\Kit\\Support\\ApiResponse;

/** The starter module's API: the current workspace's notes (viewers may only read; EnforceRole). */
class NoteController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->successResponse(Note::latest('updated_at')->get());
    }

    public function store(Request $request): JsonResponse
    {
        return $this->createdResponse(Note::create($this->validated($request)), 'Note added');
    }

    public function update(Request $request, Note $note): JsonResponse
    {
        $note->update($this->validated($request));

        return $this->successResponse($note, 'Note saved');
    }

    public function destroy(Note $note): JsonResponse
    {
        $note->delete();

        return $this->deletedResponse('Note deleted');
    }

    private function validated(Request $request): array
    {
        return $request->validate(['title' => 'required|string|max:160', 'body' => 'nullable|string|max:10000']);
    }
}
`;
}

function usersMigration() {
  return `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

/** What the kit reads on users beyond its own migrations: a role, and two-step verification. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->nullable();
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['role', 'two_factor_secret', 'two_factor_recovery_codes', 'two_factor_confirmed_at']));
    }
};
`;
}

function workspaceMigration(p) {
  const w = p.workspace;
  return lines(
    '<?php',
    '',
    'use Illuminate\\Database\\Migrations\\Migration;',
    'use Illuminate\\Database\\Schema\\Blueprint;',
    'use Illuminate\\Support\\Facades\\Schema;',
    '',
    `/** ${w.plural}: what people work on together. */`,
    'return new class extends Migration',
    '{',
    '    public function up(): void',
    '    {',
    `        Schema::create(${q(w.table)}, function (Blueprint $table) {`,
    '            $table->id();',
    p.accounts && "            $table->unsignedBigInteger('account_id')->nullable()->index();",
    "            $table->string('name');",
    "            $table->string('slug', 80)->unique();",
    "            $table->string('status', 20)->default('active'); // active | suspended | archived",
    '            $table->timestamps();',
    '        });',
    '    }',
    '',
    '    public function down(): void',
    '    {',
    `        Schema::dropIfExists(${q(w.table)});`,
    '    }',
    '};',
    '',
  );
}

function notesMigration(p) {
  return lines(
    '<?php',
    '',
    'use Illuminate\\Database\\Migrations\\Migration;',
    'use Illuminate\\Database\\Schema\\Blueprint;',
    'use Illuminate\\Support\\Facades\\Schema;',
    '',
    '/** The starter module: notes, each in one workspace. */',
    'return new class extends Migration',
    '{',
    '    public function up(): void',
    '    {',
    "        Schema::create('notes', function (Blueprint $table) {",
    '            $table->id();',
    `            $table->unsignedBigInteger(${q(p.workspace.foreignKey)})->index();`,
    "            $table->string('title');",
    "            $table->text('body')->nullable();",
    '            $table->timestamps();',
    '        });',
    '    }',
    '',
    '    public function down(): void',
    '    {',
    "        Schema::dropIfExists('notes');",
    '    }',
    '};',
    '',
  );
}

function seeder(p) {
  return lines(
    '<?php',
    '',
    'namespace Database\\Seeders;',
    '',
    p.accounts && 'use App\\Models\\Account;',
    'use App\\Models\\User;',
    'use Illuminate\\Database\\Seeder;',
    '',
    '/**',
    ` * The first person who can sign in: ${p.platform ? 'a superadmin' : 'an admin'}, verified, from`,
    ' * OKJT_ADMIN_EMAIL / OKJT_ADMIN_PASSWORD in .env. Run once: php artisan db:seed',
    ' */',
    'class DatabaseSeeder extends Seeder',
    '{',
    '    public function run(): void',
    '    {',
    "        $email = env('OKJT_ADMIN_EMAIL');",
    "        $password = env('OKJT_ADMIN_PASSWORD');",
    '        if (! $email || ! $password) {',
    "            $this->command?->warn('Set OKJT_ADMIN_EMAIL and OKJT_ADMIN_PASSWORD in .env to create the first user.');",
    '',
    '            return;',
    '        }',
    '',
    '        $user = User::firstOrNew([\'email\' => $email]);',
    "        $user->forceFill([",
    `            'name' => env('OKJT_ADMIN_NAME', ${q(`${p.name} admin`)}),`,
    "            'password' => $password,",
    "            'role' => config('okjt.roles.owner'),",
    "            'email_verified_at' => now(),",
    p.platform && "            'is_superadmin' => true,",
    '        ])->save();',
    p.accounts && lines(
      '',
      '        if (! $user->ownedAccount()) {',
      "            Account::create(['name' => $user->name])->members()->attach($user->id, ['role' => config('okjt.accounts.owner_role')]);",
      '        }',
    ),
    '    }',
    '}',
    '',
  );
}

function starterTest(p) {
  const w = p.workspace;
  return lines(
    '<?php',
    '',
    'namespace Tests\\Feature;',
    '',
    p.accounts && 'use App\\Models\\Account;',
    'use App\\Models\\User;',
    'use Illuminate\\Foundation\\Testing\\RefreshDatabase;',
    'use Tests\\TestCase;',
    '',
    `/** The starter works end to end: signing up and in, a ${w.label}, its notes and their history, and roles. */`,
    'class StarterTest extends TestCase',
    '{',
    '    use RefreshDatabase;',
    '',
    '    private function person(string $email): User',
    '    {',
    "        $user = User::create(['name' => ucfirst(strtok($email, '@')), 'email' => $email, 'password' => 'secret-password']);",
    "        $user->forceFill(['email_verified_at' => now()])->save();",
    p.accounts && "        Account::create(['name' => $user->name])->members()->attach($user->id, ['role' => 'owner']);",
    '',
    '        return $user;',
    '    }',
    '',
    '    public function test_signing_up_asks_for_email_verification_first(): void',
    '    {',
    "        $this->postJson('/api/register', ['name' => 'Ann', 'email' => 'ann@example.com', 'password' => 'secret-password', 'password_confirmation' => 'secret-password'])",
    "            ->assertCreated()->assertJsonPath('data.requires_verification', true);",
    '',
    "        $this->postJson('/api/login', ['email' => 'ann@example.com', 'password' => 'secret-password'])",
    "            ->assertOk()->assertJsonPath('data.requires_verification', true);",
    '    }',
    '',
    '    public function test_a_verified_person_signs_in(): void',
    '    {',
    "        $this->person('bo@example.com');",
    '',
    "        $this->postJson('/api/login', ['email' => 'bo@example.com', 'password' => 'secret-password'])",
    "            ->assertOk()->assertJsonPath('data.user.email', 'bo@example.com')",
    "            ->assertJsonPath('data.token', fn ($token) => ! empty($token));",
    '    }',
    '',
    `    public function test_a_${w.label.replace(/ /g, '_')}_has_notes_with_history_and_viewers_only_read(): void`,
    '    {',
    "        $owner = $this->person('owner@example.com');",
    `        $slug = $this->actingAs($owner, 'sanctum')->postJson('/api/${w.path}', ['name' => 'First one'])->assertCreated()->json('data.slug');`,
    `        $this->getJson('/api/${w.path}')->assertJsonPath('data.0.role', 'owner');`,
    '',
    "        $headers = ['X-Workspace' => $slug];",
    "        $note = $this->postJson('/api/notes', ['title' => 'Kick-off'], $headers)->assertCreated()->json('data');",
    "        $this->putJson(\"/api/notes/{$note['id']}\", ['title' => 'Kick-off, Monday'], $headers)->assertOk();",
    "        $this->getJson('/api/revisions', $headers)->assertOk()->assertJsonPath('data.data.0.module', 'notes');",
    '',
    "        $viewer = $this->person('viewer@example.com');",
    `        $viewer->setRoleIn(\\App\\Models\\${w.Model}::where('slug', $slug)->first(), 'viewer');`,
    "        $this->actingAs($viewer, 'sanctum')->getJson('/api/notes', $headers)->assertOk()->assertJsonCount(1, 'data');",
    "        $this->postJson('/api/notes', ['title' => 'Mine'], $headers)->assertForbidden();",
    '',
    "        $stranger = $this->person('stranger@example.com');",
    "        $this->actingAs($stranger, 'sanctum')->getJson('/api/notes', $headers)->assertForbidden();",
    '    }',
    '}',
    '',
  );
}

function verifyEmailNotification() {
  return `<?php

namespace App\\Notifications;

use Illuminate\\Auth\\Notifications\\VerifyEmail;

/**
 * The verification email. Its link opens the app's /verify-email page, which
 * sends the id and hash to POST /api/email/verify (the kit's
 * EmailVerificationController), and signs the person in.
 */
class VerifyEmailAddress extends VerifyEmail
{
    protected function verificationUrl($notifiable): string
    {
        $app = rtrim(config('app.frontend_url') ?: config('app.url'), '/');

        return $app.'/verify-email/'.$notifiable->getKey().'/'.sha1($notifiable->getEmailForVerification());
    }
}
`;
}

function notificationsMigration(p) {
  return lines(
    '<?php',
    '',
    'use Illuminate\\Database\\Migrations\\Migration;',
    'use Illuminate\\Database\\Schema\\Blueprint;',
    'use Illuminate\\Support\\Facades\\Schema;',
    '',
    `/** The dashboard's bell: Laravel's notifications, each in one ${p.workspace.label} (the kit's Notification model). */`,
    'return new class extends Migration',
    '{',
    '    public function up(): void',
    '    {',
    "        Schema::create('notifications', function (Blueprint $table) {",
    "            $table->uuid('id')->primary();",
    `            $table->unsignedBigInteger(${q(p.workspace.foreignKey)})->nullable()->index();`,
    "            $table->string('type');",
    "            $table->morphs('notifiable');",
    "            $table->text('data');",
    "            $table->timestamp('read_at')->nullable();",
    '            $table->timestamps();',
    '        });',
    '    }',
    '',
    '    public function down(): void',
    '    {',
    "        Schema::dropIfExists('notifications');",
    '    }',
    '};',
    '',
  );
}
