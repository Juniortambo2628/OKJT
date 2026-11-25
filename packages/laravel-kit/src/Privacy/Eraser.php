<?php

namespace Okjt\Kit\Privacy;

/**
 * One part of an app that holds people's data, and how to remove one
 * person's. A project lists its own in okjt.privacy.erasers (after the kit's
 * ContactMessageEraser); each runs when a request is erased, in one database
 * transaction, inside the request's workspace when per_workspace is on.
 *
 * Erase or anonymise: a row other records count on (a guest in a seating
 * plan) can stay with its personal details cleared, as Naoa's GuestEraser
 * does. Write straight to the database (DB::table) where the model records
 * versions, or the version history keeps a copy of what was erased.
 */
interface Eraser
{
    /**
     * Remove what this part holds about the person in $request (name, email,
     * phone, subject_id). Returns a short line for the outcome ("2 contact
     * messages deleted"), or null when it held nothing about them.
     */
    public function erase(ErasureRequest $request): ?string;
}
