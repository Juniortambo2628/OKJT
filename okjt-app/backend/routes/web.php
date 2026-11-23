<?php

use App\Http\Controllers\FeedController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

// Every page search engines should index, for /robots.txt to point at.
Route::get('/sitemap.xml', SitemapController::class);

// The published insights as RSS (feed readers, and DEV's import with okjtech.co.ke as the canonical).
Route::get('/feed.xml', FeedController::class);

// Every page of the site and the dashboard: the React app (okjt-app/web,
// built into public/) with the page's meta tags. /api, /up and /storage
// are not pages.
Route::get('/{path?}', SpaController::class)
    ->where('path', '^(?!(api|up|storage|sanctum)(/|$)).*$');
