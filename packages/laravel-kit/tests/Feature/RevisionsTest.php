<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Routing\Middleware\SubstituteBindings;
use Okjt\Kit\Http\Controllers\RevisionController;
use Okjt\Kit\Http\Middleware\EnforceRole;
use Okjt\Kit\Http\Middleware\ResolveWorkspace;
use Okjt\Kit\Revisions\Revision;
use Okjt\Kit\Tests\Fixtures\Note;
use Okjt\Kit\Tests\Fixtures\Project;
use Okjt\Kit\Tests\TestCase;
use Okjt\Kit\Workspace\CurrentWorkspace;

class RevisionsTest extends TestCase
{
    protected function defineRoutes($router): void
    {
        $router->middleware([ResolveWorkspace::class, SubstituteBindings::class, EnforceRole::class])->prefix('api')->group(function () use ($router) {
            $router->get('/revisions', [RevisionController::class, 'index']);
            $router->post('/revisions/{revision}/restore', [RevisionController::class, 'restore']);
        });
    }

    public function test_changes_are_recorded_and_quick_edits_merge(): void
    {
        $project = Project::create(['slug' => 'p']);
        $this->actingAs($editor = $this->person('e@example.com', $project, 'editor'));
        CurrentWorkspace::set($project);

        $note = Note::create(['title' => 'Draft']);
        $note->update(['title' => 'Second']);
        $note->update(['body' => 'Text']);
        $note->delete();

        $this->assertSame(['created', 'updated', 'deleted'], Revision::orderBy('id')->pluck('action')->all());
        $updated = Revision::where('action', 'updated')->first();
        $this->assertEqualsCanonicalizing(['title', 'body'], $updated->changed);
        $this->assertSame('notes', $updated->module);
        $this->assertSame($editor->id, $updated->user_id);
        $this->assertSame($project->id, $updated->project_id);

        $this->travel(11)->minutes();
        Note::create(['title' => 'Later'])->update(['title' => 'Later still']);
        $this->assertSame(2, Revision::where('action', 'updated')->count());
    }

    public function test_a_deleted_record_can_be_restored_through_the_api(): void
    {
        $project = Project::create(['slug' => 'p']);
        $this->actingAs($this->person('e@example.com', $project, 'editor'));
        CurrentWorkspace::set($project);
        $note = Note::create(['title' => 'Keep me']);
        $note->delete();
        $deletion = Revision::where('action', 'deleted')->first();
        CurrentWorkspace::set(null);

        $this->getJson('/api/revisions', ['X-Workspace' => 'p'])->assertOk()
            ->assertJsonPath('data.data.0.action', 'deleted')
            ->assertJsonPath('data.data.0.restorable', true);
        $this->postJson("/api/revisions/{$deletion->id}/restore", [], ['X-Workspace' => 'p'])->assertOk()->assertJson(['message' => 'Version restored']);

        CurrentWorkspace::set($project);
        $this->assertSame('Keep me', Note::first()?->title);
        $this->assertSame('restored', Revision::latest('id')->first()->action);
    }

    public function test_another_workspaces_history_is_not_found(): void
    {
        $mine = Project::create(['slug' => 'mine']);
        $theirs = Project::create(['slug' => 'theirs']);
        $this->actingAs($this->person('e@example.com', $mine, 'editor'));
        $other = CurrentWorkspace::run($theirs, fn () => tap(Note::create(['title' => 'Theirs']))->delete());
        $revision = Revision::withoutGlobalScope('workspace')->where('action', 'deleted')->first();

        $this->postJson("/api/revisions/{$revision->id}/restore", [], ['X-Workspace' => 'mine'])->assertNotFound();
        $this->getJson('/api/revisions', ['X-Workspace' => 'mine'])->assertJsonPath('data.total', 0);
    }

    public function test_nothing_is_recorded_while_migrations_run(): void
    {
        Revision::pause();
        Note::create(['title' => 'Seeded']);
        Revision::resume();
        $this->assertSame(0, Revision::count());
    }
}
