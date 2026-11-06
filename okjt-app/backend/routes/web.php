<?php

use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

// Every page of the site and the dashboard: the React app (okjt-app/web,
// built into public/) with the page's meta tags. /api, /up and /storage
// are not pages.
Route::get('/{path?}', SpaController::class)
    ->where('path', '^(?!(api|up|storage|sanctum)(/|$)).*$');
