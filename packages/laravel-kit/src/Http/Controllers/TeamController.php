<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Okjt\Kit\Support\ApiResponse;
use Okjt\Kit\Support\Messages;

/**
 * An account's team: staff who work on all its workspaces (new ones too) or
 * on chosen ones, with one role across them. Only the account's owners
 * manage it. The field names come from okjt.accounts.fields (shown here with
 * the defaults).
 *
 *   GET    /team            → account, workspaces, members
 *   POST   /team            { name, email, all_workspaces, workspace_role, workspace_ids }
 *   PUT    /team/{user}     { all_workspaces, workspace_role, workspace_ids }
 *   DELETE /team/{user}     (off the team and its workspaces; their sign-in stays)
 *
 * Projects change which account is the team's (teamAccount), plan limits
 * (ensureRoomFor), the links and the invitation email.
 */
class TeamController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $account = $this->teamAccount($request);
        if (! $account) {
            return $this->forbiddenResponse(Messages::get('team_owners_only'));
        }
        $f = $this->fields();
        $ids = $account->workspaces()->pluck('id');

        return $this->successResponse([
            'account' => ['id' => $account->id, 'name' => $account->name],
            $f['list'] => $account->workspaces()->orderBy('name')->get(['id', 'name', 'slug'])->toArray(),
            'members' => $account->members()->orderBy('name')->get()->map(fn (Model $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->pivot->role,
                $f['all'] => (bool) $u->pivot->{$f['all']},
                $f['role'] => $u->pivot->{$f['role']},
                'pending' => $u->invited_by !== null && $u->invite_accepted_at === null,
                $f['ids'] => $this->workspaceMembers()->where('user_id', $u->id)->whereIn($this->workspaceKey(), $ids)->pluck($this->workspaceKey())->all(),
                'is_you' => $u->is($request->user()),
            ])->all(),
        ]);
    }

    public function invite(Request $request): JsonResponse
    {
        $account = $this->teamAccount($request);
        if (! $account) {
            return $this->forbiddenResponse(Messages::get('team_owners_only'));
        }
        $validated = $this->validateAccess($request, $account, [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
        ]);

        $person = config('okjt.user_model')::where('email', $validated['email'])->first();
        if ($person && $account->members()->whereKey($person->id)->exists()) {
            return $this->errorResponse('This person is already on your team.', 422);
        }

        $link = null;
        DB::transaction(function () use ($account, $request, $validated, &$person, &$link) {
            if (! $person) {
                $person = config('okjt.user_model')::create(['name' => $validated['name'], 'email' => $validated['email'], 'password' => Str::password(32)]);
                $person->forceFill(['invited_by' => $request->user()->id])->save();
                $token = Str::random(64);
                DB::table('password_reset_tokens')->updateOrInsert(['email' => $person->email], ['token' => Hash::make($token), 'created_at' => now()]);
                $link = $this->acceptLink($person->email, $token);
            }
            $f = $this->fields();
            $account->members()->attach($person->id, [
                'role' => config('okjt.accounts.staff_role'),
                $f['all'] => $validated[$f['all']],
                $f['role'] => $validated[$f['role']],
            ]);
            $this->syncWorkspaces($account, $person, $validated);
        });

        // Someone who already signs in just gets access; never a password link.
        $link ??= $this->signInLink();
        $emailed = true;
        try {
            $this->sendInvitation($person, $request->user(), $link, $account);
        } catch (\Throwable $e) {
            Log::warning('Team invitation email failed: '.$e->getMessage());
            $emailed = false;
        }

        return $this->createdResponse(['id' => $person->id, 'invite_link' => $link, 'emailed' => $emailed], "{$person->name} is on your team");
    }

    public function update(Request $request, mixed $user): JsonResponse
    {
        $account = $this->teamAccount($request);
        $member = $this->staffMember($account, $user);
        if (! $member) {
            return $this->notFoundResponse('Team member not found');
        }
        $validated = $this->validateAccess($request, $account);
        $f = $this->fields();

        DB::transaction(function () use ($account, $member, $validated, $f) {
            $account->members()->updateExistingPivot($member->id, [$f['all'] => $validated[$f['all']], $f['role'] => $validated[$f['role']]]);
            $this->syncWorkspaces($account, $member, $validated);
        });

        return $this->successResponse(['id' => $member->id], 'Access updated');
    }

    /** Off the team: out of the account and all of its workspaces. Their sign-in stays. */
    public function destroy(Request $request, mixed $user): JsonResponse
    {
        $account = $this->teamAccount($request);
        $member = $this->staffMember($account, $user);
        if (! $member) {
            return $this->notFoundResponse('Team member not found');
        }

        DB::transaction(function () use ($account, $member) {
            $ids = $account->workspaces()->pluck('id');
            $this->workspaceMembers()->where('user_id', $member->id)->whereIn($this->workspaceKey(), $ids)->delete();
            DB::table(config('okjt.collaboration.visits_table'))->where('user_id', $member->id)->whereIn($this->workspaceKey(), $ids)->delete();
            $account->members()->detach($member->id);
        });

        return $this->deletedResponse("{$member->name} is no longer on your team");
    }

    // ---- What a project changes ---------------------------------------------

    /** The account whose team this is: the first one you own. */
    protected function teamAccount(Request $request): ?Model
    {
        return $request->user()->ownedAccount();
    }

    /** Before $person joins $workspace: throw if the plan has no room for another person there. */
    protected function ensureRoomFor(Model $account, Model $workspace): void {}

    /** Where someone who already has a sign-in goes to sign in. */
    protected function signInLink(): string
    {
        return $this->siteUrl().'/sign-in';
    }

    /** Where someone new sets their password and joins. */
    protected function acceptLink(string $email, string $token): string
    {
        return $this->siteUrl().'/accept-invite?'.http_build_query(['email' => $email, 'token' => $token]);
    }

    protected function sendInvitation(Model $person, Model $inviter, string $link, Model $account): void
    {
        $body = "{$inviter->name} has added you to {$account->name}'s team on ".config('app.name').".\n\n"
            ."Open this link to join: {$link}\n";
        Mail::raw($body, fn ($mail) => $mail->to($person->email)->subject("You've joined {$account->name}'s team"));
    }

    // ---- The rest -----------------------------------------------------------

    private function validateAccess(Request $request, Model $account, array $extra = []): array
    {
        $f = $this->fields();
        $workspace = new (config('okjt.workspace.model'));
        $validated = $request->validate($extra + [
            $f['role'] => ['required', Rule::in(config('okjt.accounts.staff_workspace_roles'))],
            $f['all'] => 'required|boolean',
            $f['ids'] => 'array',
            $f['ids'].'.*' => ['integer', Rule::exists($workspace->getTable(), 'id')->where(config('okjt.accounts.foreign_key'), $account->id)],
        ]);
        $validated[$f['ids']] ??= [];

        return $validated;
    }

    /**
     * Give $person exactly the chosen workspaces (or all of them) with their
     * role, within each one's limits; take the others away.
     */
    private function syncWorkspaces(Model $account, Model $person, array $access): void
    {
        $f = $this->fields();
        $chosen = $access[$f['all']] ? $account->workspaces()->pluck('id')->all() : array_map('intval', $access[$f['ids']]);

        foreach ($account->workspaces()->get() as $workspace) {
            $isIn = $person->isMemberOf($workspace);
            if (in_array($workspace->id, $chosen, true)) {
                if (! $isIn) {
                    $this->ensureRoomFor($account, $workspace);
                }
                $person->setRoleIn($workspace, $access[$f['role']]);
            } elseif ($isIn) {
                $this->workspaceMembers()->where($this->workspaceKey(), $workspace->id)->where('user_id', $person->id)->delete();
            }
        }
    }

    private function staffMember(?Model $account, mixed $user): ?Model
    {
        $id = $user instanceof Model ? $user->getKey() : $user;
        $member = $account?->members()->whereKey($id)->first();

        return $member && $member->pivot->role === config('okjt.accounts.staff_role') ? $member : null;
    }

    private function fields(): array
    {
        return config('okjt.accounts.fields');
    }

    private function workspaceMembers()
    {
        return DB::table(config('okjt.workspace.members_table'));
    }

    private function workspaceKey(): string
    {
        return config('okjt.workspace.foreign_key');
    }

    private function siteUrl(): string
    {
        return rtrim(config('app.frontend_url') ?: config('app.url'), '/');
    }
}
