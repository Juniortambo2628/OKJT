<?php

namespace Okjt\Kit\Tests\Fixtures;

use Illuminate\Database\Eloquent\Model;
use Okjt\Kit\Http\Controllers\CollaborationController;

/** The kit's controller as a project extends it (no Sanctum in the test app, so no token). */
class TestCollaborationController extends CollaborationController
{
    public static bool $full = false;

    protected function ensureRoomForAnother(): void
    {
        abort_if(self::$full, 402, 'Your plan is full.');
    }

    protected function acceptedPayload(Model $user): array
    {
        return ['user' => $user->only(['id', 'name', 'email'])];
    }
}
