<?php

namespace Database\Seeders;

use RuntimeException;

/**
 * Applied to every seeder that truncates or force-deletes real tables.
 *
 * DatabaseSeeder already refuses to run outside `local`; this trait protects
 * the same seeders against a direct `php artisan db:seed --class=...` on a
 * production database.
 */
trait RebuildsDemoContent
{
    protected function guardAgainstProduction(string $seeder): void
    {
        if (app()->environment('production')) {
            throw new RuntimeException(
                class_basename($seeder).' truncates live data and cannot run in production.'
            );
        }
    }
}
