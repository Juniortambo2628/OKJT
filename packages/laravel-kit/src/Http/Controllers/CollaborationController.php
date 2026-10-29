<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Database\Eloquent\Builder;
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
use Okjt\Kit\Workspace\CurrentWorkspace;

/**
 * Working together on one workspace (the current one, see ResolveWorkspace):
 *   - heartbeat: who is on which page (presence) and which modules changed
 *     since you last looked (sidebar badges)
 *   - collaborators: invite people by email, list them, change their role
 *   - accept: an invitee sets their password from the emailed link
 *
 * Routes:
 *   POST  /collaboration/heartbeat        { module, path }        any member
 *   GET   /collaborators                                          any member
 *   POST  /collaborators/invite           { name, email, role?, message? }   owners
 *   PATCH /collaborators/{user}/role      { role }                owners
 *   POST  /collaborators/accept           { email, token, password, password_confirmation }   no workspace, no sign-in
 *
 * Projects extend this controller to send their own invitation email
 * (sendInvitation), point its links at their own pages (signInLink,
 * acceptLink), check a plan limit before adding someone (ensureRoomForAnother)
 * and answer a newly accepted invitee with what their app needs
 * (acceptedPayload).
 */
class CollaborationController extends Controller
{
    use ApiResponse;

    public function heartbeat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'module' => 'nullable|string|max:40|alpha_dash',
            'path' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $module = $validated['module'] ?? null;
        $user->forceFill([
            'last_active_at' => now(),
            'current_module' => $module,
            'current_path' => $validated['path'] ?? null,
        ])->saveQuietly();

        $this->ensureVisits($user);
        if ($module) {
            DB::table($this->visitsTable())
                ->where(CurrentWorkspace::column(), CurrentWorkspace::id())
                ->where('user_id', $user->id)->where('module', $module)
                ->update(['seen_at' => now()]);
        }

        return $this->successResponse([
            'presence' => $this->presence($user),
            'badges' => $this->badges($user),
        ]);
    }

    public function collaborators(Request $request): JsonResponse
    {
        $online = now()->subSeconds($this->onlineSeconds());

        return $this->successResponse($this->members()->orderBy('name')->get()->map(fn (Model $u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'role' => $u->role,
            'is_you' => $u->is($request->user()),
            'pending' => $u->invited_by !== null && $u->invite_accepted_at === null,
            'online' => $u->last_active_at && $u->last_active_at->gt($online),
            'last_active_at' => $u->last_active_at,
            'current_module' => $u->current_module,
        ]));
    }

    public function invite(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'nullable|string|max:1000',
            'role' => ['sometimes', Rule::in(config('okjt.roles.all'))],
        ]);

        $role = $validated['role'] ?? config('okjt.collaboration.default_role');
        $workspace = CurrentWorkspace::get();
        $users = config('okjt.user_model');
        $existing = $users::where('email', $validated['email'])->first();
        $pending = $existing && $existing->invited_by !== null && $existing->invite_accepted_at === null;

        if ($existing && ! $pending && $existing->isMemberOf($workspace)) {
            return $this->errorResponse('This person already has access.', 422);
        }

        if (! $existing?->isMemberOf($workspace)) {
            $this->ensureRoomForAnother();
        }

        // Re-inviting someone who hasn't accepted yet just sends a fresh link.
        $invitee = $existing ?? $users::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Str::password(32),
        ]);
        if (! $existing || $pending) {
            $invitee->forceFill(['invited_by' => $request->user()->id])->save();
        }
        $invitee->setRoleIn($workspace, $role);

        if ($existing && ! $pending) {
            // Already has a sign-in (from another workspace): just add them.
            // Never a password link here: that would let this workspace's
            // owner take over an account they don't own.
            $link = $this->signInLink();
        } else {
            $token = Str::random(64);
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $invitee->email],
                ['token' => Hash::make($token), 'created_at' => now()],
            );
            $link = $this->acceptLink($invitee->email, $token);
        }

        $emailed = true;
        try {
            $this->sendInvitation($invitee, $request->user(), $link, $validated['message'] ?? null);
        } catch (\Throwable $e) {
            Log::warning('Collaborator invitation email failed: '.$e->getMessage());
            $emailed = false;
        }

        return $this->createdResponse(
            ['id' => $invitee->id, 'invite_link' => $link, 'emailed' => $emailed, 'expires_in_days' => $this->inviteDays()],
            $emailed ? "Invitation sent to {$invitee->email}" : 'Invitation created — the email could not be sent, share the link instead',
        );
    }

    /** Owners change what a collaborator may do; there is always at least one owner. */
    public function updateRole(Request $request, mixed $user): JsonResponse
    {
        $validated = $request->validate(['role' => ['required', Rule::in(config('okjt.roles.all'))]]);
        $workspace = CurrentWorkspace::get();
        $person = $user instanceof Model ? $user : config('okjt.user_model')::find($user);

        if (! $person || ! $person->isMemberOf($workspace)) {
            return $this->notFoundResponse('Collaborator not found');
        }

        $owner = config('okjt.roles.owner');
        if ($person->isOwner() && $validated['role'] !== $owner && $this->ownerCount() <= 1) {
            return $this->errorResponse('At least one owner must remain', 422);
        }

        $person->setRoleIn($workspace, $validated['role']);

        return $this->successResponse(['id' => $person->id, 'role' => $person->role], "{$person->name} is now a{$this->article($person->role)} {$person->role}");
    }

    public function accept(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $row = DB::table('password_reset_tokens')->where('email', $validated['email'])->first();
        $user = config('okjt.user_model')::where('email', $validated['email'])->first();
        $valid = $row && $user
            && Hash::check($validated['token'], $row->token)
            && now()->subDays($this->inviteDays())->lt($row->created_at);

        if (! $valid) {
            return $this->errorResponse('This invitation link is invalid or has expired. Ask for a new one.', 422);
        }

        $user->forceFill([
            'password' => $validated['password'],
            'invite_accepted_at' => $user->invite_accepted_at ?? now(),
            // An emailed invite proves the address: no second verification step.
            'email_verified_at' => $user->email_verified_at ?? now(),
        ])->save();
        DB::table('password_reset_tokens')->where('email', $user->email)->delete();

        return $this->successResponse($this->acceptedPayload($user), 'Welcome aboard!');
    }

    // ---- What a project changes ---------------------------------------------

    /** Throw (e.g. a plan-limit exception) when the workspace can't take another person. */
    protected function ensureRoomForAnother(): void {}

    /** Where someone who already has a sign-in goes to sign in. */
    protected function signInLink(): string
    {
        return rtrim(config('app.url'), '/').'/sign-in';
    }

    /** Where a new invitee sets their password. */
    protected function acceptLink(string $email, string $token): string
    {
        return rtrim(config('app.url'), '/').'/accept-invite?'.http_build_query(['email' => $email, 'token' => $token]);
    }

    /** Email the invitation. Throwing makes the answer say the email couldn't be sent. */
    protected function sendInvitation(Model $invitee, Model $inviter, string $link, ?string $message): void
    {
        $body = "{$inviter->name} has invited you to work with them on ".config('app.name').".\n\n"
            .($message ? "“{$message}”\n\n" : '')
            ."Open this link to join: {$link}\n";
        Mail::raw($body, fn ($mail) => $mail->to($invitee->email)->subject("{$inviter->name} invited you to ".config('app.name')));
    }

    /** What a newly accepted invitee gets back: a token to sign in with, and who they are. */
    protected function acceptedPayload(Model $user): array
    {
        return [
            'token' => $user->createToken(config('okjt.collaboration.token_name'))->plainTextToken,
            'user' => $user->only(['id', 'name', 'email']),
        ];
    }

    // ---- The rest ------------------------------------------------------------

    /** The people of the current workspace, as user models. */
    protected function members(): Builder
    {
        return config('okjt.user_model')::query()->whereIn('users.id', fn ($q) => $q->select('user_id')
            ->from(config('okjt.workspace.members_table'))
            ->where(CurrentWorkspace::column(), CurrentWorkspace::id()));
    }

    protected function ownerCount(): int
    {
        return DB::table(config('okjt.workspace.members_table'))
            ->where(CurrentWorkspace::column(), CurrentWorkspace::id())
            ->where('role', config('okjt.roles.owner'))
            ->count();
    }

    private function article(string $role): string
    {
        return in_array($role[0], ['a', 'e', 'i', 'o', 'u'], true) ? 'n' : '';
    }

    private function ensureVisits(Model $user): void
    {
        $id = CurrentWorkspace::id();
        $modules = config('okjt.collaboration.badge_modules', []);
        $known = DB::table($this->visitsTable())->where(CurrentWorkspace::column(), $id)->where('user_id', $user->id)->count();
        if ($known >= count($modules)) {
            return;
        }

        // First time we see a module for this person: start counting from now,
        // so a new collaborator isn't greeted by the whole history as "new".
        DB::table($this->visitsTable())->insertOrIgnore(array_map(
            fn ($module) => [CurrentWorkspace::column() => $id, 'user_id' => $user->id, 'module' => $module, 'seen_at' => now()],
            $modules,
        ));
    }

    /** Count of changes per module by anyone else since you last opened it. */
    private function badges(Model $user): array
    {
        $column = CurrentWorkspace::column();

        return DB::table('revisions as r')
            ->join($this->visitsTable().' as v', fn ($join) => $join->on('v.module', '=', 'r.module')
                ->on("v.$column", '=', "r.$column")->where('v.user_id', $user->id))
            ->where("r.$column", CurrentWorkspace::id())
            ->whereColumn('r.updated_at', '>', 'v.seen_at')
            ->where(fn ($q) => $q->whereNull('r.user_id')->orWhere('r.user_id', '!=', $user->id))
            ->groupBy('r.module')
            ->pluck(DB::raw('count(*)'), 'r.module')
            ->map(fn ($count) => (int) $count)
            ->all();
    }

    private function presence(Model $user): array
    {
        return $this->members()->where('users.id', '!=', $user->id)
            ->where('last_active_at', '>', now()->subSeconds($this->onlineSeconds()))
            ->orderBy('name')
            ->get(['users.id', 'name', 'current_module', 'current_path', 'last_active_at'])
            ->map(fn (Model $u) => $u->only(['id', 'name', 'current_module', 'current_path', 'last_active_at']))
            ->all();
    }

    private function visitsTable(): string
    {
        return config('okjt.collaboration.visits_table');
    }

    private function onlineSeconds(): int
    {
        return (int) config('okjt.collaboration.online_seconds');
    }

    private function inviteDays(): int
    {
        return (int) config('okjt.collaboration.invite_days');
    }
}
