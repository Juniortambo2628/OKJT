<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\InsightController;
use App\Http\Controllers\Api\CaseStudyController;
use App\Http\Controllers\Api\StatController;
use App\Http\Controllers\Api\SiteSettingController;
use App\Http\Controllers\Api\TestimonialController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\SubscriberController;
use App\Http\Controllers\Api\TeamMemberController;
use App\Http\Controllers\Api\ValueController;
use App\Http\Controllers\Api\ConsultationRequestController;
use App\Http\Controllers\Api\PillarController;
use App\Http\Controllers\Api\InnovationController;

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

Route::get('/case-studies', [CaseStudyController::class, 'index']);
Route::get('/case-studies/{caseStudy:slug}', [CaseStudyController::class, 'show']);

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

// Innovations public
Route::get('/innovations', [InnovationController::class, 'index']);
Route::get('/innovations/{identifier}', [InnovationController::class, 'show']);

// Public — search, tracking, newsletter
Route::get('/search', [SearchController::class, 'index']);
Route::post('/track', [AnalyticsController::class, 'track']);
Route::post('/subscribe', [SubscriberController::class, 'store']);
Route::post('/consultation-requests', [ConsultationRequestController::class, 'store']);
Route::post('/rsvps', [\App\Http\Controllers\Api\RsvpController::class, 'store']);
Route::get('/storage/{path}', [UploadController::class, 'serve'])->where('path', '.*');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // RSVP CRUD (admin)
    Route::get('/rsvps', [\App\Http\Controllers\Api\RsvpController::class, 'index']);
    Route::delete('/rsvps/{rsvp}', [\App\Http\Controllers\Api\RsvpController::class, 'destroy']);

    // Services CRUD
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{service}', [ServiceController::class, 'update']);
    Route::delete('/services/{service}', [ServiceController::class, 'destroy']);

    // Insights CRUD
    Route::post('/insights', [InsightController::class, 'store']);
    Route::put('/insights/{insight}', [InsightController::class, 'update']);
    Route::delete('/insights/{insight}', [InsightController::class, 'destroy']);

    // Case Studies CRUD
    Route::post('/case-studies', [CaseStudyController::class, 'store']);
    Route::put('/case-studies/{caseStudy}', [CaseStudyController::class, 'update']);
    Route::delete('/case-studies/{caseStudy}', [CaseStudyController::class, 'destroy']);

    // Stats CRUD
    Route::post('/stats', [StatController::class, 'store']);
    Route::put('/stats/{stat}', [StatController::class, 'update']);
    Route::delete('/stats/{stat}', [StatController::class, 'destroy']);

    // Settings
    Route::put('/settings/batch', [SiteSettingController::class, 'batchUpdate']);
    Route::put('/settings/{siteSetting}', [SiteSettingController::class, 'update']);

    // Testimonials CRUD
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

    // Innovations CRUD
    Route::post('/innovations', [InnovationController::class, 'store']);
    Route::put('/innovations/{innovation}', [InnovationController::class, 'update']);
    Route::delete('/innovations/{innovation}', [InnovationController::class, 'destroy']);

    // Consultation Requests
    Route::get('/consultation-requests', [ConsultationRequestController::class, 'index']);
    Route::put('/consultation-requests/{consultationRequest}', [ConsultationRequestController::class, 'update']);
    Route::delete('/consultation-requests/{consultationRequest}', [ConsultationRequestController::class, 'destroy']);

    // Email Templates
    Route::post('/email-templates/preview', [\App\Http\Controllers\Api\EmailTemplateController::class, 'preview']);
});
