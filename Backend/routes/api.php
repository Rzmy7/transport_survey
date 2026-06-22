<?php

use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminSurveyController;
use App\Http\Controllers\SurveyResponseController;
use App\Http\Middleware\AdminTokenAuth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'ok',
    ]);
});

Route::post('/survey-responses', [SurveyResponseController::class, 'store']);

Route::post('/admin/login', [AdminAuthController::class, 'login']);

Route::middleware(AdminTokenAuth::class)->prefix('admin')->group(function (): void {
    Route::get('/analytics', [AdminSurveyController::class, 'analytics']);
    Route::get('/survey-responses/export', [AdminSurveyController::class, 'export']);
    Route::delete('/survey-responses', [AdminSurveyController::class, 'destroyAllResponses']);
    Route::post('/logout', [AdminAuthController::class, 'logout']);
});