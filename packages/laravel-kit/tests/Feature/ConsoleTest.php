<?php

namespace Okjt\Kit\Tests\Feature;

use Okjt\Kit\Console\AuditLog;
use Okjt\Kit\Http\Controllers\ConsoleController;
use Okjt\Kit\Tests\Fixtures\Project;
use Okjt\Kit\Tests\TestCase;

class ConsoleTest extends TestCase
{
    protected function defineRoutes($router): void
    {
        $router->prefix('api/console')->group(function () use ($router) {
            $router->get('/workspaces', [ConsoleController::class, 'workspaces']);
            $router->patch('/workspaces/{workspace}/status', [ConsoleController::class, 'setStatus']);
            $router->delete('/workspaces/{workspace}', [ConsoleController::class, 'destroyWorkspace']);
            $router->get('/audit', [ConsoleController::class, 'audit']);
        });
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs($this->person('staff@example.com'));
    }

    public function test_workspaces_are_listed_newest_first_and_found_by_name_slug_or_status(): void
    {
        Project::create(['name' => 'Garden', 'slug' => 'garden']);
        Project::create(['name' => 'Shop', 'slug' => 'kiosk', 'status' => 'suspended']);

        $this->getJson('/api/console/workspaces')->assertOk()
            ->assertJsonPath('data.data.0.slug', 'kiosk')
            ->assertJsonPath('data.meta.total', 2);
        $this->getJson('/api/console/workspaces?search=gard')->assertJsonPath('data.meta.total', 1);
        $this->getJson('/api/console/workspaces?search=kio')->assertJsonPath('data.data.0.name', 'Shop');
        $this->getJson('/api/console/workspaces?status=suspended')->assertJsonPath('data.meta.total', 1);
    }

    public function test_changing_a_status_needs_a_reason_and_is_audited(): void
    {
        $project = Project::create(['name' => 'Garden', 'slug' => 'garden']);

        $this->patchJson("/api/console/workspaces/{$project->id}/status", ['status' => 'suspended'])->assertUnprocessable();
        $this->patchJson("/api/console/workspaces/{$project->id}/status", ['status' => 'gone', 'reason' => 'x'])->assertUnprocessable();

        $this->patchJson("/api/console/workspaces/{$project->id}/status", ['status' => 'suspended', 'reason' => 'Unpaid'])
            ->assertOk()
            ->assertJsonPath('message', 'Project suspended')
            ->assertJsonPath('data.status', 'suspended');

        $log = AuditLog::sole();
        $this->assertSame('project.status_changed', $log->action);
        $this->assertSame(['before' => 'active', 'after' => 'suspended', 'reason' => 'Unpaid'], $log->details);
        $this->assertSame('Garden', $log->subject_label);
    }

    public function test_deleting_needs_the_address_typed_and_is_audited(): void
    {
        $project = Project::create(['name' => 'Garden', 'slug' => 'garden']);

        $this->deleteJson("/api/console/workspaces/{$project->id}", ['confirm' => 'gardn', 'reason' => 'Asked'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.confirm.0', 'Type the project’s web address exactly to confirm.');
        $this->assertNotNull($project->fresh());

        $this->deleteJson("/api/console/workspaces/{$project->id}", ['confirm' => 'garden', 'reason' => 'Asked'])
            ->assertOk()
            ->assertJsonPath('data.removed.project', 1);
        $this->assertNull($project->fresh());
        $this->assertSame('project.deleted', AuditLog::sole()->action);
    }

    public function test_the_audit_log_says_who_did_what_newest_first(): void
    {
        $project = Project::create(['name' => 'Garden', 'slug' => 'garden']);
        $this->patchJson("/api/console/workspaces/{$project->id}/status", ['status' => 'archived', 'reason' => 'Done']);
        AuditLog::recordAbout('site.photo_changed', 'site', 'Home hero', ['before' => 'a.jpg']);

        $this->getJson('/api/console/audit')->assertOk()
            ->assertJsonPath('data.data.0.action', 'site.photo_changed')
            ->assertJsonPath('data.data.0.subject_type', 'site')
            ->assertJsonPath('data.data.0.subject_id', null)
            ->assertJsonPath('data.data.0.subject_label', 'Home hero')
            ->assertJsonPath('data.data.1.subject_type', 'project')
            ->assertJsonPath('data.data.1.by.email', 'staff@example.com')
            ->assertJsonPath('data.meta.total', 2);
    }
}
