<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Okjt\Kit\Http\Controllers\TeamController;
use Okjt\Kit\Tests\Fixtures\Account;
use Okjt\Kit\Tests\Fixtures\Project;
use Okjt\Kit\Tests\Fixtures\User;
use Okjt\Kit\Tests\TestCase;

/** A project whose plan allows two people per workspace. */
class LimitedTeam extends TeamController
{
    protected function ensureRoomFor(Model $account, Model $workspace): void
    {
        if (DB::table('project_user')->where('project_id', $workspace->id)->count() >= 2) {
            throw ValidationException::withMessages(['limit' => 'This project is full.']);
        }
    }
}

class TeamTest extends TestCase
{
    private Account $account;

    private User $owner;

    private Project $one;

    private Project $two;

    protected function defineRoutes($router): void
    {
        $router->prefix('api/team')->group(function () use ($router) {
            $router->get('/', [LimitedTeam::class, 'index']);
            $router->post('/', [LimitedTeam::class, 'invite']);
            $router->put('/{user}', [LimitedTeam::class, 'update']);
            $router->delete('/{user}', [LimitedTeam::class, 'destroy']);
        });
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->account = Account::create(['name' => 'Bloom Co']);
        $this->owner = $this->person('owner@example.com');
        $this->account->members()->attach($this->owner->id, ['role' => 'owner']);
        $this->one = Project::create(['account_id' => $this->account->id, 'name' => 'One', 'slug' => 'one']);
        $this->two = Project::create(['account_id' => $this->account->id, 'name' => 'Two', 'slug' => 'two']);
        $this->owner->setRoleIn($this->one, 'owner');
        $this->actingAs($this->owner);
    }

    private function invite(array $access): array
    {
        return $this->postJson('/api/team', ['name' => 'Sam', 'email' => 'sam@example.com'] + $access)->assertCreated()->json('data');
    }

    public function test_staff_on_all_workspaces_join_every_one_including_new_ones(): void
    {
        $data = $this->invite(['all_workspaces' => true, 'workspace_role' => 'editor']);
        $sam = User::findOrFail($data['id']);

        $this->assertSame('editor', $sam->roleIn($this->one));
        $this->assertSame('editor', $sam->roleIn($this->two));
        $this->assertStringContainsString('/accept-invite?', $data['invite_link']);

        $three = Project::create(['account_id' => $this->account->id, 'name' => 'Three', 'slug' => 'three']);
        $this->account->shareWithTeam($three);
        $this->assertSame('editor', $sam->roleIn($three));
    }

    public function test_staff_can_be_given_chosen_workspaces_and_moved_between_them(): void
    {
        $sam = User::findOrFail($this->invite(['all_workspaces' => false, 'workspace_role' => 'viewer', 'workspace_ids' => [$this->one->id]])['id']);
        $this->assertSame('viewer', $sam->roleIn($this->one));
        $this->assertNull($sam->roleIn($this->two));

        $this->putJson("/api/team/{$sam->id}", ['all_workspaces' => false, 'workspace_role' => 'owner', 'workspace_ids' => [$this->two->id]])->assertOk();
        $sam = $sam->fresh();
        $this->assertNull($sam->roleIn($this->one));
        $this->assertSame('owner', $sam->roleIn($this->two));

        $this->getJson('/api/team')->assertOk()
            ->assertJsonPath('data.account.name', 'Bloom Co')
            ->assertJsonPath('data.workspaces.0.name', 'One')
            ->assertJsonPath('data.members.1.email', 'sam@example.com')
            ->assertJsonPath('data.members.1.workspace_ids', [$this->two->id])
            ->assertJsonPath('data.members.1.pending', true)
            ->assertJsonPath('data.members.0.is_you', true);
    }

    public function test_removing_staff_takes_away_every_workspace_but_keeps_their_sign_in(): void
    {
        $sam = User::findOrFail($this->invite(['all_workspaces' => true, 'workspace_role' => 'editor'])['id']);

        $this->deleteJson("/api/team/{$sam->id}")->assertOk();

        $this->assertNull($sam->fresh()->roleIn($this->one));
        $this->assertFalse($this->account->members()->whereKey($sam->id)->exists());
        $this->assertNotNull($sam->fresh());
        // The owner isn't staff, so isn't removed this way.
        $this->deleteJson("/api/team/{$this->owner->id}")->assertNotFound();
    }

    public function test_someone_with_a_sign_in_gets_access_without_a_password_link(): void
    {
        $this->person('sam@example.com');

        $data = $this->invite(['all_workspaces' => true, 'workspace_role' => 'editor']);

        $this->assertStringEndsWith('/sign-in', $data['invite_link']);
        $this->postJson('/api/team', ['name' => 'Sam', 'email' => 'sam@example.com', 'all_workspaces' => true, 'workspace_role' => 'editor'])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'This person is already on your team.');
    }

    public function test_only_an_accounts_owners_manage_its_team(): void
    {
        $this->actingAs($this->person('stranger@example.com'));

        $this->getJson('/api/team')->assertForbidden()->assertJsonPath('message', 'Only an account’s owners manage its team.');
    }

    public function test_another_accounts_workspaces_cant_be_given_out(): void
    {
        $theirs = Project::create(['account_id' => Account::create(['name' => 'Other'])->id, 'name' => 'Theirs', 'slug' => 'theirs']);

        $this->postJson('/api/team', ['name' => 'Sam', 'email' => 'sam@example.com', 'all_workspaces' => false, 'workspace_role' => 'editor', 'workspace_ids' => [$theirs->id]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('workspace_ids.0');
    }

    public function test_the_projects_limit_holds_per_workspace(): void
    {
        $this->person('pat@example.com')->setRoleIn($this->one, 'editor');

        $this->postJson('/api/team', ['name' => 'Sam', 'email' => 'sam@example.com', 'all_workspaces' => true, 'workspace_role' => 'editor'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('limit');
        $this->assertNull(User::where('email', 'sam@example.com')->first());
    }
}
