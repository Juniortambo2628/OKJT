<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Auto-detect the Laravel base path based on the deployment layout.
// Production:  /home/zhpebukm/public_html/api/index.php -> /home/zhpebukm/okj-core
// Development: /okjt-app/backend/public/index.php       -> /okjt-app/backend
$basePath = match (true) {
    file_exists(__DIR__ . '/../../okj-core/bootstrap/app.php') => realpath(__DIR__ . '/../../okj-core'),
    file_exists(__DIR__ . '/../bootstrap/app.php') => realpath(__DIR__ . '/..'),
    default => throw new \Exception('Unable to locate Laravel bootstrap directory.'),
};

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $basePath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $basePath . '/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once $basePath . '/bootstrap/app.php')
    ->handleRequest(Request::capture());
