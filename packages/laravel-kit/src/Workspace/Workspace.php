<?php

namespace Okjt\Kit\Workspace;

/**
 * What the kit needs from a project's workspace model (a project, a wedding…).
 */
interface Workspace
{
    /** The workspace a request names (its slug, id, or whatever the app uses), or null. */
    public static function findByKey(?string $key): ?self;

    /** False while suspended or archived: only its own people get in, to be told why. */
    public function isActive(): bool;

    /** False until its owners publish it: its public side is only for its own people. */
    public function isPublished(): bool;
}
