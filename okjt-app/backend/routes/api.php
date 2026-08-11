<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ConsultationRequestController;
use App\Http\Controllers\Api\InsightController;
use App\Http\Controllers\Api\PageViewController;
use App\Http\Controllers\Api\PillarController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\RsvpController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\SiteSettingController;
use App\Http\Controllers\Api\StatController;
use App\Http\Controllers\Api\SubscriberController;
use App\Http\Controllers\Api\TeamMemberController;
use App\Http\Controllers\Api\TestimonialController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ValueController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);

Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{service:slug}', [ServiceController::class, 'show']);

Route::get('/insights', [InsightController::class, 'index']);
Route::get('/insights/{insight:slug}', [InsightController::class, 'show']);

Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{identifier}', [ProjectController::class, 'show']);

Route::get('/stats', [StatController::class, 'index']);
Route::get('/settings', [SiteSettingController::class, 'index']);
Route::get('/site-settings/maintenance', [SiteSettingController::class, 'getMaintenanceSettings']);

Route::get('/testimonials', [TestimonialController::class, 'index']);
Route::get('/clients', [ClientController::class, 'index']);
Route::get('/team-members', [TeamMemberController::class, 'index']);
Route::get('/values', [ValueController::class, 'index']);

// Pillars public
Route::get('/pillars', [PillarController::class, 'index']);
Route::get('/pillars/{slug}', [PillarController::class, 'show']);

// Public — search, tracking, newsletter
Route::get('/search', [SearchController::class, 'index']);
Route::post('/track', [AnalyticsController::class, 'track']);
Route::post('/subscribe', [SubscriberController::class, 'store']);
Route::post('/unsubscribe', [SubscriberController::class, 'unsubscribe']);
Route::post('/consultation-requests', [ConsultationRequestController::class, 'store']);
Route::post('/rsvps', [RsvpController::class, 'store']);
Route::get('/storage/{path}', [UploadController::class, 'serve'])->where('path', '.*');

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/password/reset', [AuthController::class, 'sendResetLink']);
Route::post('/password/reset/confirm', [AuthController::class, 'resetPassword']);

// Protected routes — any authenticated user
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});

// Admin-only routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/rsvps', [RsvpController::class, 'index']);
    Route::get('/rsvps/{rsvp}', [RsvpController::class, 'show']);
    Route::put('/rsvps/{rsvp}', [RsvpController::class, 'update']);
    Route::delete('/rsvps/{rsvp}', [RsvpController::class, 'destroy']);

    // Services CRUD
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{service}', [ServiceController::class, 'update']);
    Route::delete('/services/{service}', [ServiceController::class, 'destroy']);

    // Insights CRUD
    Route::post('/insights', [InsightController::class, 'store']);
    Route::put('/insights/{insight}', [InsightController::class, 'update']);
    Route::delete('/insights/{insight}', [InsightController::class, 'destroy']);

    // Projects CRUD
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

    // Stats CRUD
    Route::post('/stats', [StatController::class, 'store']);
    Route::put('/stats/{stat}', [StatController::class, 'update']);
    Route::delete('/stats/{stat}', [StatController::class, 'destroy']);

    // Settings
    Route::put('/settings/batch', [SiteSettingController::class, 'batchUpdate']);
    Route::put('/settings/{siteSetting}', [SiteSettingController::class, 'update']);

    // Testimonials CRUD
    Route::get('/testimonials/{testimonial}', [TestimonialController::class, 'show']);
    Route::post('/testimonials', [TestimonialController::class, 'store']);
    Route::put('/testimonials/{testimonial}', [TestimonialController::class, 'update']);
    Route::delete('/testimonials/{testimonial}', [TestimonialController::class, 'destroy']);

    // Clients CRUD
    Route::post('/clients', [ClientController::class, 'store']);
    Route::put('/clients/{client}', [ClientController::class, 'update']);
    Route::delete('/clients/{client}', [ClientController::class, 'destroy']);

    // File Upload
    Route::post('/upload', [UploadController::class, 'store']);
    Route::delete('/upload', [UploadController::class, 'destroy']);

    // Analytics (admin)
    Route::get('/analytics/summary', [AnalyticsController::class, 'summary']);

    // Subscribers (admin)
    Route::get('/subscribers', [SubscriberController::class, 'index']);
    Route::get('/subscribers/{subscriber}', [SubscriberController::class, 'show']);
    Route::put('/subscribers/{subscriber}', [SubscriberController::class, 'update']);
    Route::delete('/subscribers/{subscriber}', [SubscriberController::class, 'destroy']);

    // Team Members
    Route::post('/team-members', [TeamMemberController::class, 'store']);
    Route::put('/team-members/{teamMember}', [TeamMemberController::class, 'update']);
    Route::delete('/team-members/{teamMember}', [TeamMemberController::class, 'destroy']);

    // Values
    Route::post('/values', [ValueController::class, 'store']);
    Route::put('/values/{value}', [ValueController::class, 'update']);
    Route::delete('/values/{value}', [ValueController::class, 'destroy']);

    // Pillars CRUD
    Route::post('/pillars', [PillarController::class, 'store']);
    Route::put('/pillars/{pillar}', [PillarController::class, 'update']);
    Route::delete('/pillars/{pillar}', [PillarController::class, 'destroy']);

    // Consultation Requests
    Route::get('/consultation-requests', [ConsultationRequestController::class, 'index']);
    Route::get('/consultation-requests/{consultationRequest}', [ConsultationRequestController::class, 'show']);
    Route::put('/consultation-requests/{consultationRequest}', [ConsultationRequestController::class, 'update']);
    Route::delete('/consultation-requests/{consultationRequest}', [ConsultationRequestController::class, 'destroy']);

    // Email Templates (admin only)
    Route::get('/email-templates', [SiteSettingController::class, 'emailTemplates']);
    Route::get('/email-templates/{key}', [SiteSettingController::class, 'showEmailTemplate']);
    Route::post('/email-templates', [SiteSettingController::class, 'storeEmailTemplate']);
    Route::put('/email-templates/{key}', [SiteSettingController::class, 'updateEmailTemplate']);
    Route::delete('/email-templates/{key}', [SiteSettingController::class, 'destroyEmailTemplate']);
    Route::post('/email-templates/preview', [SiteSettingController::class, 'previewEmailTemplate']);

    // Users (admin management)
    Route::apiResource('users', UserController::class);

    // Page Views (read-only analytics)
    Route::get('/page-views', [PageViewController::class, 'index']);
    Route::get('/page-views/export', [PageViewController::class, 'export']);
});
