<?php

/*
 * The OKJT kit's server settings. Publish with
 *   php artisan vendor:publish --tag=okjt-config
 */
return [

    'user_model' => env('OKJT_USER_MODEL', 'App\\Models\\User'),

    /*
     * The record people work on together: a project, a wedding, a site. Every
     * model using BelongsToWorkspace is scoped to the current one.
     */
    'workspace' => [
        // Implements Okjt\Kit\Workspace\Workspace.
        'model' => 'App\\Models\\Project',

        // The column on workspace-owned tables, and the table of who belongs
        // to which workspace with what role (workspace column, user_id, role).
        'foreign_key' => 'project_id',
        'members_table' => 'project_user',

        // The name of the global scope (for withoutGlobalScope()).
        'scope' => 'workspace',

        // How a request names its workspace: a header, or a query parameter
        // for plain links (downloads, calendar files).
        'header' => 'X-Workspace',
        'query' => 'workspace',

        // Uploads of the current workspace go under "{folder}/{id}/{kind}".
        'folder' => 'projects',

        // API routes that work without a workspace (signing in, your account,
        // your list of workspaces). Every other route is refused without one.
        'open_routes' => [
            'api/login',
            'api/logout',
            'api/register',
            'api/user',
        ],
    ],

    /*
     * Roles in a workspace, most to least capable. The owner role may do
     * everything; the viewer role may only read, except for the writes listed
     * in viewer_writes (their own session, account security, presence).
     */
    'roles' => [
        'owner' => 'owner',
        'viewer' => 'viewer',
        'all' => ['owner', 'editor', 'viewer'],
        'viewer_writes' => [
            'api/logout',
        ],
    ],

    /*
     * What people are told when they are turned away. ":workspace" is the
     * workspace's name for people ("project").
     */
    'label' => 'project',
    'messages' => [
        'not_found' => 'This :workspace could not be found.',
        'unavailable' => 'This :workspace isn’t available.',
        'unpublished' => 'This :workspace isn’t published yet.',
        'none_selected' => 'No :workspace selected.',
        'no_access' => 'You don\'t have access to this :workspace.',
        'inactive' => 'This :workspace is not active.',
        'owners_only' => 'Only owners can do this.',
        'view_only' => 'You have view-only access.',
        'superadmin_only' => 'Only administrators can do this.',
        'confirm_address' => 'Type the :workspace’s web address exactly to confirm.',
        'sign_in_expired' => 'That sign-in link expired — try again.',
        'account_not_found' => 'Account not found.',
    ],

    /*
     * Working together (CollaborationController): presence counts for
     * online_seconds after a heartbeat; invitation links last invite_days;
     * badge_modules are the dashboard modules (revision modules) that show a
     * "new changes" badge, tracked per person in visits_table.
     */
    'collaboration' => [
        'online_seconds' => 60,
        'invite_days' => 7,
        'default_role' => 'editor',
        'badge_modules' => [],
        'visits_table' => 'module_visits',
        'token_name' => 'dashboard',
    ],

    /*
     * Signing in (AuthController, EmailVerificationController): the name of
     * the Sanctum tokens issued, and what a new sign-up is told. Signing in
     * with Google (SocialAuthController) sends the browser back to
     * {app.frontend_url}{social.return_path} with a code that lasts
     * social.code_minutes; new_user_name is for accounts without a name.
     */
    'auth' => [
        'token_name' => 'dashboard',
        'welcome' => 'Welcome — check your inbox to verify your email.',
        'new_user_name' => 'New user',
        'social' => [
            'return_path' => '/auth/google',
            'code_minutes' => 5,
        ],
    ],

    'notifications' => [
        'model' => Okjt\Kit\Notifications\Notification::class,
    ],

    /*
     * The console (ConsoleController), for platform staff: the statuses a
     * workspace can be given, and the model of the audit log of what staff
     * did there (Okjt\Kit\Console\AuditLog or a subclass).
     */
    'console' => [
        'statuses' => ['active', 'suspended', 'archived'],
        'audit_model' => Okjt\Kit\Console\AuditLog::class,
    ],

    /*
     * Backups (BackupService, BackupController, backups:create and
     * backups:verify), kept in storage/app/backups. auto switches the safety
     * copies taken before risky bulk changes (snapshot()). Scheduled backups
     * can be copied off-site (backups:create --offsite) to a filesystem disk
     * and/or by email (mail is the Mailable sent). A project extending
     * BackupService names its class in service.
     */
    'backups' => [
        'service' => Okjt\Kit\Backups\BackupService::class,
        'auto' => env('AUTO_BACKUPS', true),
        'mail' => Okjt\Kit\Backups\BackupCreated::class,
        'offsite' => [
            'disk' => env('BACKUP_OFFSITE_DISK') ?: null,
            'path' => env('BACKUP_OFFSITE_PATH', 'backups'),
            'email' => env('BACKUP_OFFSITE_EMAIL') ?: null,
            'email_max_mb' => (float) env('BACKUP_OFFSITE_EMAIL_MAX_MB', 15),
        ],
        // Runtime state rather than anyone's data.
        'skipped_tables' => [
            'migrations', 'personal_access_tokens', 'sessions', 'cache', 'cache_locks',
            'jobs', 'job_batches', 'failed_jobs', 'password_reset_tokens',
        ],
    ],

    /*
     * Version history (RecordsRevisions): rapid edits by one person to one
     * record merge into one version; versions older than keep_days are pruned
     * by model:prune.
     */
    'revisions' => [
        'model' => Okjt\Kit\Revisions\Revision::class,
        'coalesce_minutes' => 10,
        'keep_days' => 180,
    ],
];
