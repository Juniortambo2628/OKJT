<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        JsonResource::withoutWrapping();
        Schema::defaultStringLength(191);

        // The emailed reset link opens the dashboard's own page.
        ResetPassword::createUrlUsing(function ($user, string $token) {
            return rtrim(config('app.frontend_url'), '/').'/admin/password-reset?'.http_build_query([
                'token' => $token,
                'email' => $user->getEmailForPasswordReset(),
            ]);
        });
    }
}
