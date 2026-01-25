<?php

// Load Laravel application
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use Illuminate\Support\Facades\Artisan;

echo "<h1>Running Migrations...</h1>";

try {
    Artisan::call('migrate', ['--force' => true]);
    echo "<pre>" . Artisan::output() . "</pre>";
    echo "<h3 style='color: green;'>Migration Completed Successfully!</h3>";
} catch (\Exception $e) {
    echo "<h3 style='color: red;'>Migration Failed:</h3>";
    echo "<pre>" . $e->getMessage() . "</pre>";
}
