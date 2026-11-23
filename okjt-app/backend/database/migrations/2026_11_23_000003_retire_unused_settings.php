<?php

use App\Support\RetiredSettings;
use Illuminate\Database\Migrations\Migration;

/**
 * Site settings left from the earlier versions of the site that nothing
 * reads any more (the old About and home sections, pictures for sections
 * that are gone, the old assistant widget): they cluttered Settings with
 * fields that change nothing. The list is App\Support\RetiredSettings.
 */
return new class extends Migration
{
    public function up(): void
    {
        RetiredSettings::remove();
    }

    public function down(): void
    {
        // Their old values are not kept; re-running the seeders recreates the keys.
    }
};
