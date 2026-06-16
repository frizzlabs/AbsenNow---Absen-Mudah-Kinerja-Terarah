<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AttendanceController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/verify-pin', [AuthController::class, 'verifyPin']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/save-pin', [AuthController::class, 'savePin']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/attendance/today', [AttendanceController::class, 'statusToday']);
    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);
    Route::get('/offices', [AttendanceController::class, 'offices']);
    Route::post('/offices/update-coordinates', [AttendanceController::class, 'updateOfficeCoordinates']);
    Route::get('/attendance/history', [AttendanceController::class, 'history']);
});
