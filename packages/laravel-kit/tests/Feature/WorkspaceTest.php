<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Routing\Middleware\SubstituteBindings;
use Okjt\Kit\Http\Middleware\EnforceRole;
use Okjt\Kit\Http\Middleware\EnsureSuperadmin;
use Okjt\Kit\Http\Middleware\ResolveWorkspace;
use Okjt\Kit\Tests\Fixtures\Note;
use Okjt\Kit\Tests\Fixtures\Project;
use Okjt\Kit\Tests\TestCase;
use Okjt\Kit\Workspace\CurrentWorkspace;

class WorkspaceTest extends TestCase
{
    protected function defineRoutes($router): void
    {
        config(['okjt.workspace.open_routes' => ['api/user', 'api/console']]);
        $router->middleware([ResolveWorkspace::class, SubstituteBindings::class])->prefix('api')->group(function () use ($router) {
            $router->get('/user', fn () => ['ok' => true]);
            $router->middleware(EnforceRole::class)->group(function () use ($router) {
                $router->get('/notes', fn () => Note::pluck('title'));
                $router->post('/notes', fn () => Note::create(['title' => request('title')]));
                $router->delete('/project', fn () => ['deleted' => true])->middleware(EnforceRole::class.':owner');
            });
            $router->get('/console', fn () => ['ok' => true])->middleware(EnsureSuperadmin::class);
        });
    }

    public function test_rows_belong_to_the_current_workspace_only(): void
    {
        $a = Project::create(['slug' => 'a']);
        $b = Project::create(['slug' => 'b']);
        CurrentWorkspace::run($a, fn () => Note::create(['title' => 'In A']));
        CurrentWorkspace::run($b, fn () => Note::create(['title' => 'In B']));

        CurrentWorkspace::set($a);
        $this->assertSame(['In A'], Note::pluck('title')->all());
        $this->assertSame($a->id, Note::first()->project_id);
        $this->assertCount(2, Note::withoutGlobalScope('workspace')->get());
        $this->assertSame('projects/'.$a->id.'/photos', CurrentWorkspace::folder('photos'));
    }

    public function test_a_request_must_name_its_workspace_unless_the_route_is_open(): void
    {
        $this->getJson('/api/notes')->assertStatus(400)->assertJson(['message' => 'No project selected.', 'reason' => 'project']);
        $this->getJson('/api/user')->assertOk();
        $this->getJson('/api/notes', ['X-Workspace' => 'nope'])->assertNotFound()->assertJson(['message' => 'This project could not be found.']);
    }

    public function test_an_unpublished_or_inactive_workspace_answers_only_its_people(): void
    {
        $draft = Project::create(['slug' => 'draft', 'published' => false]);
        $paused = Project::create(['slug' => 'paused', 'status' => 'suspended']);
        $this->getJson('/api/notes', ['X-Workspace' => 'draft'])->assertNotFound()->assertJson(['reason' => 'unpublished']);
        $this->getJson('/api/notes', ['X-Workspace' => 'paused'])->assertNotFound()->assertJson(['reason' => 'unavailable']);

        $this->actingAs($this->person('ann@example.com', $draft, 'editor'));
        $this->getJson('/api/notes', ['X-Workspace' => 'draft'])->assertOk();

        $this->actingAs($this->person('bo@example.com', $paused, 'owner'));
        $this->getJson('/api/notes', ['X-Workspace' => 'paused'])->assertForbidden()->assertJson(['message' => 'This project is not active.']);
    }

    public function test_roles_decide_what_people_may_do(): void
    {
        $project = Project::create(['slug' => 'p']);
        $headers = ['X-Workspace' => 'p'];

        $this->actingAs($this->person('out@example.com'));
        $this->getJson('/api/notes', $headers)->assertForbidden()->assertJson(['message' => "You don't have access to this project.", 'reason' => 'role']);

        $this->actingAs($this->person('view@example.com', $project, 'viewer'));
        $this->getJson('/api/notes', $headers)->assertOk();
        $this->postJson('/api/notes', ['title' => 'x'], $headers)->assertForbidden()->assertJson(['message' => 'You have view-only access.']);

        $this->actingAs($this->person('edit@example.com', $project, 'editor'));
        $this->postJson('/api/notes', ['title' => 'Plan'], $headers)->assertCreated();
        $this->deleteJson('/api/project', [], $headers)->assertForbidden()->assertJson(['message' => 'Only owners can do this.']);

        $this->actingAs($this->person('own@example.com', $project, 'owner'));
        $this->deleteJson('/api/project', [], $headers)->assertOk();
    }

    public function test_viewers_may_make_the_writes_listed_for_them(): void
    {
        config(['okjt.roles.viewer_writes' => ['api/notes']]);
        $project = Project::create(['slug' => 'p']);
        $this->actingAs($this->person('view@example.com', $project, 'viewer'));
        $this->postJson('/api/notes', ['title' => 'Allowed'], ['X-Workspace' => 'p'])->assertCreated();
    }

    public function test_the_console_is_for_superadmins(): void
    {
        $this->actingAs($this->person('a@example.com'));
        $this->getJson('/api/console')->assertForbidden()->assertJson(['message' => 'Only administrators can do this.']);

        $admin = $this->person('b@example.com');
        $admin->forceFill(['is_superadmin' => true])->save();
        $this->actingAs($admin);
        $this->getJson('/api/console')->assertOk();
    }

    public function test_role_is_per_workspace_and_falls_back_outside_one(): void
    {
        $a = Project::create(['slug' => 'a']);
        $b = Project::create(['slug' => 'b']);
        $user = $this->person('x@example.com', $a, 'owner');
        $user->setRoleIn($b, 'viewer');
        $user->forceFill(['role' => 'owner'])->save();

        CurrentWorkspace::set($b);
        $this->assertSame('viewer', $user->fresh()->role);
        $this->assertFalse($user->fresh()->isOwner());
        CurrentWorkspace::set(null);
        $this->assertSame('owner', $user->fresh()->role);
        $this->assertTrue($user->isMemberOf($a));
    }
}
