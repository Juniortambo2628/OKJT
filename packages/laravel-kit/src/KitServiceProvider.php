<?php

namespace Okjt\Kit;

use Illuminate\Database\Events\MigrationsEnded;
use Illuminate\Database\Events\MigrationsStarted;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Okjt\Kit\Backups\BackupService;
use Okjt\Kit\Console\CreateBackup;
use Okjt\Kit\Console\VerifyBackup;
use Okjt\Kit\Revisions\Revision;

class KitServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/okjt.php', 'okjt');

        // The project's BackupService, wherever the kit's is asked for.
        $this->app->bind(BackupService::class, function ($app) {
            $service = config('okjt.backups.service');

            return $service === BackupService::class ? $app->build($service) : $app->make($service);
        });
    }

    public function boot(): void
    {
        $this->publishes([__DIR__.'/../config/okjt.php' => config_path('okjt.php')], 'okjt-config');

        // For new projects; a project that already has these tables skips them.
        $this->publishesMigrations([__DIR__.'/../database/migrations' => database_path('migrations')], 'okjt-migrations');

        // The emailed reset link opens the app's reset page (PasswordResetController).
        // A project that builds its own link calls createUrlUsing after this.
        \Illuminate\Auth\Notifications\ResetPassword::createUrlUsing(fn ($user, string $token) => rtrim(config('app.frontend_url') ?: config('app.url'), '/')
            .config('okjt.auth.password_reset.path', '/reset-password').'/'.$token.'?'.http_build_query(['email' => $user->getEmailForPasswordReset()]));

        $this->loadViewsFrom(__DIR__.'/../resources/views', 'okjt');

        if ($this->app->runningInConsole()) {
            $this->commands([CreateBackup::class, VerifyBackup::class]);
        }

        // Migrations change rows in bulk: those aren't versions anyone made.
        Event::listen(MigrationsStarted::class, fn () => Revision::pause());
        Event::listen(MigrationsEnded::class, fn () => Revision::resume());
    }
}
