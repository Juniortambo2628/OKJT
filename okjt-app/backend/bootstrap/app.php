<?php

use App\Http\Middleware\AddCacheHeaders;
use App\Http\Middleware\IsAdmin;
use App\Http\Middleware\NoIndexApi;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'api/*',
            'sanctum/csrf-cookie',
        ]);
        $middleware->alias([
            'admin' => IsAdmin::class,
        ]);

        // NoIndexApi first, so the header is also on AddCacheHeaders' 304s.
        $middleware->api(prepend: [
            NoIndexApi::class,
            HandleCors::class,
            AddCacheHeaders::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
