<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Okjt\Kit\Http\Middleware\EnforceRole;
use Okjt\Kit\Http\Middleware\ResolveWorkspace;
use Okjt\Kit\Tests\Fixtures\Note;
use Okjt\Kit\Tests\Fixtures\Project;
use Okjt\Kit\Tests\Fixtures\TestCollaborationController as Collab;
use Okjt\Kit\Tests\Fixtures\User;
use Okjt\Kit\Tests\TestCase;
use Okjt\Kit\Workspace\CurrentWorkspace;

class CollaborationTest extends TestCase
{
    private array $headers = ['X-Workspace' => 'p'];

    protected function defineRoutes($router): void
    {
        config([
            'okjt.workspace.open_routes' => ['api/collaborators/accept'],
            'okjt.roles.viewer_writes' => ['api/collaboration/heartbeat'],
            'okjt.collaboration.badge_modules' => ['notes', 'files'],
        ]);
        $router->middleware([ResolveWorkspace::class, SubstituteBindings::class])->prefix('api')->group(function () use ($router) {
            $router->post('/collaborators/accept', [Collab::class, 'accept']);
            $router->middleware(EnforceRole::class)->group(function () use ($router) {
                $router->post('/collaboration/heartbeat', [Collab::class, 'heartbeat']);
                $router->get('/collaborators', [Collab::class, 'collaborators']);
                $router->middleware(EnforceRole::class.':owner')->group(function () use ($router) {
                    $router->post('/collaborators/invite', [Collab::class, 'invite']);
                    $router->patch('/collaborators/{user}/role', [Collab::class, 'updateRole']);
                });
            });
        });
    }

    protected function tearDown(): void
    {
        Collab::$full = false;
        parent::tearDown();
    }

    public function test_heartbeat_shows_who_else_is_here_and_what_changed_since_you_looked(): void
    {
        $project = Project::create(['slug' => 'p']);
        $ann = $this->person('ann@example.com', $project, 'editor');
        $bo = $this->person('bo@example.com', $project, 'viewer');

        $this->actingAs($ann)->postJson('/api/collaboration/heartbeat', ['module' => 'notes'], $this->headers)
            ->assertOk()->assertJsonPath('data.presence', [])->assertJsonPath('data.badges', []);

        $this->travel(30)->seconds();
        $this->actingAs($bo)->postJson('/api/collaboration/heartbeat', ['module' => 'files', 'path' => '/files'], $this->headers)
            ->assertOk()->assertJsonPath('data.presence.0.name', 'Ann');
        CurrentWorkspace::run($project, fn () => Note::create(['title' => 'Made by Bo']));
        CurrentWorkspace::set(null);

        $this->actingAs($ann)->postJson('/api/collaboration/heartbeat', ['module' => 'files'], $this->headers)
            ->assertOk()
            ->assertJsonPath('data.presence.0.current_module', 'files')
            ->assertJsonPath('data.badges.notes', 1);
    }

    public function test_owners_invite_people_who_accept_from_the_emailed_link(): void
    {
        Mail::fake();
        $project = Project::create(['slug' => 'p']);
        $owner = $this->person('own@example.com', $project, 'owner');

        $link = $this->actingAs($owner)->postJson('/api/collaborators/invite', ['name' => 'Cy', 'email' => 'cy@example.com', 'role' => 'viewer'], $this->headers)
            ->assertCreated()->assertJson(['message' => 'Invitation sent to cy@example.com', 'data' => ['emailed' => true]])
            ->json('data.invite_link');
        $this->assertStringContainsString('/accept-invite?', $link);
        $this->actingAs($owner)->getJson('/api/collaborators', $this->headers)
            ->assertJsonPath('data.0.email', 'cy@example.com')->assertJsonPath('data.0.pending', true)->assertJsonPath('data.0.role', 'viewer');

        parse_str(parse_url($link, PHP_URL_QUERY), $query);
        $this->postJson('/api/collaborators/accept', ['email' => 'cy@example.com', 'token' => $query['token'], 'password' => 'long-enough', 'password_confirmation' => 'long-enough'])
            ->assertOk()->assertJson(['message' => 'Welcome aboard!', 'data' => ['user' => ['email' => 'cy@example.com']]]);
        $this->assertNotNull(User::where('email', 'cy@example.com')->first()->invite_accepted_at);
        $this->postJson('/api/collaborators/accept', ['email' => 'cy@example.com', 'token' => $query['token'], 'password' => 'long-enough', 'password_confirmation' => 'long-enough'])
            ->assertStatus(422);
    }

    public function test_someone_with_a_sign_in_is_added_without_a_password_link(): void
    {
        Mail::fake();
        $project = Project::create(['slug' => 'p']);
        $owner = $this->person('own@example.com', $project, 'owner');
        $this->person('dee@example.com');

        $link = $this->actingAs($owner)->postJson('/api/collaborators/invite', ['name' => 'Dee', 'email' => 'dee@example.com'], $this->headers)
            ->assertCreated()->json('data.invite_link');
        $this->assertStringEndsWith('/sign-in', $link);
        $this->assertSame(0, DB::table('password_reset_tokens')->count());
        $this->assertSame('editor', User::where('email', 'dee@example.com')->first()->roleIn($project));
        $this->actingAs($owner)->postJson('/api/collaborators/invite', ['name' => 'Dee', 'email' => 'dee@example.com'], $this->headers)
            ->assertStatus(422)->assertJson(['message' => 'This person already has access.']);
    }

    public function test_the_projects_limit_and_owner_rules_apply(): void
    {
        $project = Project::create(['slug' => 'p']);
        $owner = $this->person('own@example.com', $project, 'owner');
        $editor = $this->person('ed@example.com', $project, 'editor');

        Collab::$full = true;
        $this->actingAs($owner)->postJson('/api/collaborators/invite', ['name' => 'Ez', 'email' => 'ez@example.com'], $this->headers)->assertStatus(402);

        $this->actingAs($editor)->patchJson("/api/collaborators/{$owner->id}/role", ['role' => 'viewer'], $this->headers)->assertForbidden();
        $this->actingAs($owner)->patchJson("/api/collaborators/{$owner->id}/role", ['role' => 'editor'], $this->headers)
            ->assertStatus(422)->assertJson(['message' => 'At least one owner must remain']);
        $this->actingAs($owner)->patchJson("/api/collaborators/{$editor->id}/role", ['role' => 'owner'], $this->headers)
            ->assertOk()->assertJson(['message' => 'Ed is now an owner']);
        $this->actingAs($owner)->patchJson('/api/collaborators/999/role', ['role' => 'viewer'], $this->headers)->assertNotFound();
    }
}
