<?php

use App\Models\SiteCheck;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Site check reports are kept for 30 days (App\Models\SiteCheck).
Schedule::command('model:prune', ['--model' => [SiteCheck::class]])->daily();
