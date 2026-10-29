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
