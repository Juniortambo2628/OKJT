<?php

namespace Okjt\Kit;

use Illuminate\Database\Events\MigrationsEnded;
use Illuminate\Database\Events\MigrationsStarted;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Okjt\Kit\Revisions\Revision;

class KitServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/okjt.php', 'okjt');
    }

    public function boot(): void
    {
        $this->publishes([__DIR__.'/../config/okjt.php' => config_path('okjt.php')], 'okjt-config');

        // For new projects; a project that already has these tables skips them.
        $this->publishesMigrations([__DIR__.'/../database/migrations' => database_path('migrations')], 'okjt-migrations');

        // Migrations change rows in bulk: those aren't versions anyone made.
        Event::listen(MigrationsStarted::class, fn () => Revision::pause());
        Event::listen(MigrationsEnded::class, fn () => Revision::resume());
    }
}
