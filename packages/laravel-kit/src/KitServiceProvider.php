<?php

namespace Okjt\Kit;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Database\Events\MigrationsEnded;
use Illuminate\Database\Events\MigrationsStarted;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Okjt\Kit\Backups\BackupService;
use Okjt\Kit\Console\ApplyRetention;
use Okjt\Kit\Console\CreateBackup;
use Okjt\Kit\Console\ReconcileMpesa;
use Okjt\Kit\Console\VerifyBackup;
use Okjt\Kit\Http\Controllers\ConfirmedLinkController;
use Okjt\Kit\Payments\Mpesa\DarajaGateway;
use Okjt\Kit\Payments\Mpesa\MpesaGateway;
use Okjt\Kit\Payments\Mpesa\MpesaSettings;
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

        // M-Pesa: one settings reader per request, and the gateway the config names.
        $this->app->scoped(MpesaSettings::class);
        $this->app->bind(MpesaGateway::class, fn ($app) => $app->make(config('okjt.mpesa.gateway', DarajaGateway::class)));
    }

    public function boot(): void
    {
        // The browser error log's channel (ClientErrorController): a file, not a
        // table, that rotates itself and holds no more than a week of other
        // people's stack traces. A project's own definition wins.
        if (! config()->has('logging.channels.okjt_client')) {
            config()->set('logging.channels.okjt_client', [
                'driver' => 'daily',
                'path' => storage_path('logs/client-errors.log'),
                'level' => 'debug',
                'days' => 7,
                'replace_placeholders' => true,
            ]);
        }

        $this->publishes([__DIR__.'/../config/okjt.php' => config_path('okjt.php')], 'okjt-config');

        // For new projects; a project that already has these tables skips them.
        $this->publishesMigrations([__DIR__.'/../database/migrations' => database_path('migrations')], 'okjt-migrations');

        // Where the emailed reset link opens (okjt.auth.password_reset.link_to_app):
        // true, the app's reset page ({app.frontend_url}{path}/{token}, for an app
        // on another origin using PasswordResetController); false, Laravel's own
        // link to the `password.reset` route; left out, the app's page only when
        // the project has no `password.reset` route of its own. Laravel's
        // frontend_url defaults to http://localhost:3000, so pointing an app that
        // serves its own reset page there sent people to localhost. Decided when
        // the link is made, after the routes are loaded. A project that builds
        // its own link calls createUrlUsing after this.
        \Illuminate\Auth\Notifications\ResetPassword::createUrlUsing(function ($user, string $token) {
            $email = $user->getEmailForPasswordReset();
            $toApp = config('okjt.auth.password_reset.link_to_app');
            if ($toApp === false || ($toApp === null && Route::has('password.reset'))) {
                return url(route('password.reset', ['token' => $token, 'email' => $email], false));
            }

            return rtrim(config('app.frontend_url') ?: config('app.url'), '/')
                .config('okjt.auth.password_reset.path', '/reset-password').'/'.$token.'?'.http_build_query(['email' => $email]);
        });

        $this->loadViewsFrom(__DIR__.'/../resources/views', 'okjt');

        // A link in an email that changes something (unsubscribe) opens a page
        // asking first; the change happens on the button. Link scanners that
        // open every link change nothing. From Tena-host.
        //   Route::confirmedLink('/u/{token}', Unsubscribe::class, 'unsubscribe');
        Route::macro('confirmedLink', function (string $uri, string $action, ?string $name = null) {
            $show = Route::get($uri, [ConfirmedLinkController::class, 'show'])->defaults('okjt_action', $action)->middleware('signed');
            Route::post($uri, [ConfirmedLinkController::class, 'confirm'])->defaults('okjt_action', $action)->middleware('signed');

            return $name ? $show->name($name) : $show;
        });

        // The safety net for M-Pesa answers that never came, for projects that
        // declare the M-Pesa switch (it does nothing while the switch is off).
        $this->callAfterResolving(Schedule::class, function (Schedule $schedule) {
            if (config('okjt.mpesa.reconcile') && array_key_exists((string) config('okjt.mpesa.switch', 'mpesa'), (array) config('okjt.switches', []))) {
                $schedule->command('okjt:mpesa-reconcile')->everyMinute()->withoutOverlapping()->runInBackground();
            }
        });

        if ($this->app->runningInConsole()) {
            $this->commands([CreateBackup::class, VerifyBackup::class, ApplyRetention::class, ReconcileMpesa::class]);
        }

        // Migrations change rows in bulk: those aren't versions anyone made.
        Event::listen(MigrationsStarted::class, fn () => Revision::pause());
        Event::listen(MigrationsEnded::class, fn () => Revision::resume());
    }
}
