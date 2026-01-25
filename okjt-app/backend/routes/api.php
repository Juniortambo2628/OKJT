<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PortfolioController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\BackupController;
use App\Http\Controllers\Api\HeroSlideController;
use App\Http\Controllers\Api\SiteSettingsController;
use App\Http\Controllers\Api\TrustedClientController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/

// Portfolio
Route::prefix('portfolio')->group(function () {
    Route::get('/', [PortfolioController::class, 'index']);
    Route::get('/categories', [PortfolioController::class, 'categories']);
    Route::get('/featured', [PortfolioController::class, 'featured']);
    Route::get('/{id}', [PortfolioController::class, 'show']);
});

// Hero Slides (public)
Route::get('hero-slides', [HeroSlideController::class, 'publicIndex']);

// Site Settings (public - for social links)
Route::get('site-settings', [SiteSettingsController::class, 'publicIndex']);

// Trusted Clients (public - for carousel)
Route::get('trusted-clients', [TrustedClientController::class, 'publicIndex']);

// Contact
Route::prefix('contact')->group(function () {
    Route::post('/', [ContactController::class, 'store']);
    Route::get('/available-times', [ContactController::class, 'availableTimes']);
});

// Analytics (public endpoints)
Route::prefix('analytics')->group(function () {
    Route::post('/page-visit', [AnalyticsController::class, 'trackPageVisit']);
    Route::post('/click', [AnalyticsController::class, 'trackClick']);
    Route::post('/form-submission', [AnalyticsController::class, 'trackFormSubmission']);
});

// Auth (public - token based, no CSRF needed)
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

/*
|--------------------------------------------------------------------------
| Authenticated API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });

    // Admin prefix for all admin routes
    Route::prefix('admin')->group(function () {
        // Portfolio Management
        Route::prefix('portfolio')->group(function () {
            Route::post('/', [PortfolioController::class, 'store']);
            Route::put('/{id}', [PortfolioController::class, 'update']);
            Route::patch('/{id}/toggle-featured', [PortfolioController::class, 'toggleFeatured']);
            Route::delete('/{id}', [PortfolioController::class, 'destroy']);
            Route::post('/reorder', [PortfolioController::class, 'reorder']);
            Route::get('/tags/all', [PortfolioController::class, 'getAllTags']);
                // Media (Image Gallery)
                Route::get('/{id}/media', [PortfolioController::class, 'media']);
                Route::post('/{id}/media', [PortfolioController::class, 'uploadMedia']);
                Route::delete('/{id}/media/{mediaId}', [PortfolioController::class, 'deleteMedia']);
                Route::post('/{id}/media/{mediaId}/primary', [PortfolioController::class, 'setPrimaryImage']);
        });

        // Contact Submissions Management
        Route::prefix('submissions')->group(function () {
            Route::get('/', [ContactController::class, 'index']);
            Route::get('/recent', [ContactController::class, 'recent']);
            Route::get('/upcoming', [ContactController::class, 'upcomingAppointments']);
            Route::get('/{id}', [ContactController::class, 'show']);
            Route::patch('/{id}/status', [ContactController::class, 'updateStatus']);
            Route::delete('/{id}', [ContactController::class, 'destroy']);
            // Comments on submissions
            Route::get('/{id}/comments', [CommentController::class, 'forSubmission']);
            Route::post('/{id}/comments', [CommentController::class, 'storeForSubmission']);
        });

        // Analytics Dashboard
        Route::prefix('analytics')->group(function () {
            Route::get('/dashboard', [AnalyticsController::class, 'getDashboardStats']);
            Route::get('/page-views', [AnalyticsController::class, 'getPageViews']);
            Route::get('/popular-pages', [AnalyticsController::class, 'getPopularPages']);
            Route::get('/visitors', [AnalyticsController::class, 'getVisitorStats']);
        });

        // Notifications
        Route::prefix('notifications')->group(function () {
            Route::get('/', [App\Http\Controllers\Api\NotificationController::class, 'index']);
            Route::get('/unread-count', [App\Http\Controllers\Api\NotificationController::class, 'unreadCount']);
            Route::patch('/{id}/read', [App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
            Route::post('/mark-all-read', [App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
            Route::delete('/{id}', [App\Http\Controllers\Api\NotificationController::class, 'destroy']);
        });

        // Activity Log
        Route::prefix('activity-log')->group(function () {
            Route::get('/', [ActivityLogController::class, 'index']);
            Route::get('/stats', [ActivityLogController::class, 'getStats']);
            Route::get('/{id}', [ActivityLogController::class, 'show']);
        });

        // Export
        Route::prefix('export')->group(function () {
            Route::get('/portfolio/excel', [ExportController::class, 'exportPortfolio']);
            Route::get('/portfolio/csv', [ExportController::class, 'exportPortfolioCsv']);
            Route::get('/submissions/excel', [ExportController::class, 'exportSubmissions']);
            Route::get('/submissions/csv', [ExportController::class, 'exportSubmissionsCsv']);
        });

        // Comments (generic operations)
        Route::delete('comments/{id}', [CommentController::class, 'destroy']);

        // Advanced Search
        Route::get('search', [SearchController::class, 'search']);

        // Backups
        Route::post('backups/run', [BackupController::class, 'run']);
        Route::get('backups/latest', [BackupController::class, 'latest']);

        // Hero Slides (admin)
        Route::prefix('hero-slides')->group(function () {
            Route::get('/', [HeroSlideController::class, 'index']);
            Route::post('/', [HeroSlideController::class, 'store']);
            Route::put('/{id}', [HeroSlideController::class, 'update']);
            Route::delete('/{id}', [HeroSlideController::class, 'destroy']);
            Route::post('/{id}/background', [HeroSlideController::class, 'uploadBackground']);
        });

        // Site Settings (admin)
        Route::prefix('site-settings')->group(function () {
            Route::get('/', [SiteSettingsController::class, 'index']);
            Route::put('/', [SiteSettingsController::class, 'update']);
            Route::post('/portfolio', [SiteSettingsController::class, 'uploadPortfolio']);
            Route::delete('/portfolio', [SiteSettingsController::class, 'deletePortfolio']);
            Route::post('/avatar', [SiteSettingsController::class, 'uploadAvatar']);
        });

        // Trusted Clients (admin)
        Route::prefix('trusted-clients')->group(function () {
            Route::get('/', [TrustedClientController::class, 'index']);
            Route::post('/', [TrustedClientController::class, 'store']);
            Route::put('/{id}', [TrustedClientController::class, 'update']);
            Route::delete('/{id}', [TrustedClientController::class, 'destroy']);
            Route::post('/{id}/logo', [TrustedClientController::class, 'uploadLogo']);
            Route::post('/reorder', [TrustedClientController::class, 'reorder']);
        });
    });
});
