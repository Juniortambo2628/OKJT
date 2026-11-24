<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Collapse the three historical `rsvps.attendance` vocabularies onto the
     * single domain now enforced by RsvpController validation and consumed by
     * RsvpConfirmation / emails.rsvp.confirmation: accepted | declined | null.
     *
     * Historical values folded in:
     *   accept, virtual, in_person -> accepted
     *   decline                    -> declined
     */
    public function up(): void
    {
        DB::table('rsvps')
            ->whereIn('attendance', ['accept', 'virtual', 'in_person'])
            ->update(['attendance' => 'accepted']);

        DB::table('rsvps')
            ->where('attendance', 'decline')
            ->update(['attendance' => 'declined']);
    }

    /**
     * Restore the 'accept' / 'decline' vocabulary.
     *
     * LOSSY BY DESIGN: 'virtual' and 'in_person' are indistinguishable once
     * `up()` has run, so every 'accepted' row is restored as 'accept'. Run
     * `down()` only if you are certain no legacy values were folded in.
     */
    public function down(): void
    {
        DB::table('rsvps')
            ->where('attendance', 'accepted')
            ->update(['attendance' => 'accept']);

        DB::table('rsvps')
            ->where('attendance', 'declined')
            ->update(['attendance' => 'decline']);
    }
};
