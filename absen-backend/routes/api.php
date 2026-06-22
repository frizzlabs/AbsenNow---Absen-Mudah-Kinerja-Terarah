<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\LeaveController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\OvertimeController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\TimesheetController;
use App\Http\Controllers\Api\PayslipController;
use App\Http\Controllers\Api\PerformanceController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AttendanceCorrectionController;
use App\Http\Controllers\Api\DinasLuarController;
use App\Http\Controllers\Api\IdentityController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])->middleware('throttle:10,1');
Route::post('/verify-pin', [AuthController::class, 'verifyPin'])->middleware('throttle:15,1');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('/forgot-password/verify-otp', [AuthController::class, 'verifyPasswordResetOtp'])->middleware('throttle:5,1');
Route::post('/forgot-password/reset', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');

// Public tenant branding (web subdomain resolves nama/logo Pemda sebelum login)
Route::get('/tenant/{code}', [\App\Http\Controllers\Api\TenantController::class, 'show']);

Route::middleware(['auth:sanctum', 'tenant'])->group(function () {
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
    Route::get('/attendance/team/today', [AttendanceController::class, 'teamToday']);
    Route::get('/attendance/team/list', [AttendanceController::class, 'teamList']);
    Route::get('/attendance/{id}', [AttendanceController::class, 'show'])->whereNumber('id');

    // Leave Endpoints
    Route::get('/leave/balances', [LeaveController::class, 'balances']);
    Route::get('/leave/requests', [LeaveController::class, 'requests']);
    Route::post('/leave/request', [LeaveController::class, 'store']);
    Route::get('/leave/delegates', [LeaveController::class, 'delegates']);

    // Expense Endpoints
    Route::get('/expense/requests', [ExpenseController::class, 'index']);
    Route::get('/expense/requests/{id}', [ExpenseController::class, 'show']);
    Route::post('/expense/request', [ExpenseController::class, 'store']);

    // Permission Endpoints
    Route::get('/permission/requests', [PermissionController::class, 'index']);
    Route::get('/permission/requests/{id}', [PermissionController::class, 'show']);
    Route::post('/permission/request', [PermissionController::class, 'store']);

    // Overtime Endpoints
    Route::get('/overtime/requests', [OvertimeController::class, 'index']);
    Route::get('/overtime/summary', [OvertimeController::class, 'summary']);
    Route::get('/overtime/requests/{id}', [OvertimeController::class, 'show']);
    Route::post('/overtime/request', [OvertimeController::class, 'store']);

    // Activity Endpoints
    Route::get('/activities', [ActivityController::class, 'index']);
    Route::get('/activities/summary', [ActivityController::class, 'summary']);
    Route::get('/activities/{id}', [ActivityController::class, 'show']);
    Route::post('/activities', [ActivityController::class, 'store']);
    Route::put('/activities/{id}', [ActivityController::class, 'update']);
    Route::delete('/activities/{id}', [ActivityController::class, 'destroy']);

    // Timesheet Endpoints
    Route::get('/timesheets', [TimesheetController::class, 'index']);
    Route::get('/timesheets/{id}', [TimesheetController::class, 'show']);
    Route::post('/timesheets/submit', [TimesheetController::class, 'store']);
    Route::post('/timesheets/{id}/resubmit', [TimesheetController::class, 'resubmit']);

    // Payslip Endpoints
    Route::get('/payslips', [PayslipController::class, 'index']);
    Route::get('/payslips/{id}', [PayslipController::class, 'show']);

    // Profile Endpoints
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);

    // Identity Endpoints
    Route::get('/identity', [IdentityController::class, 'show']);
    Route::post('/identity', [IdentityController::class, 'store']);

    // Current user role & permissions (untuk gating UI)
    Route::get('/me/permissions', [AdminUserController::class, 'me']);

    // Admin: Roles & Privileges
    Route::get('/roles', [RoleController::class, 'index']);
    Route::get('/roles/{id}', [RoleController::class, 'show']);
    Route::put('/roles/{id}/permissions', [RoleController::class, 'updatePermissions']);

    // Platform super-admin: Organizations (Pemda) management
    Route::get('/admin/organizations', [\App\Http\Controllers\Api\OrganizationController::class, 'index']);
    Route::post('/admin/organizations', [\App\Http\Controllers\Api\OrganizationController::class, 'store']);
    Route::put('/admin/organizations/{id}', [\App\Http\Controllers\Api\OrganizationController::class, 'update']);

    // Admin: User management
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::post('/admin/users', [AdminUserController::class, 'store']);
    Route::post('/admin/users/import', [AdminUserController::class, 'import']);
    Route::put('/admin/users/{id}/role', [AdminUserController::class, 'updateRole']);

    // Admin: Office management (org-scoped)
    Route::post('/offices', [\App\Http\Controllers\Api\OfficeController::class, 'store']);
    Route::put('/offices/{id}', [\App\Http\Controllers\Api\OfficeController::class, 'update']);

    // Attendance Correction (Koreksi / Lupa Absen)
    Route::get('/attendance/corrections', [AttendanceCorrectionController::class, 'index']);
    Route::post('/attendance/corrections', [AttendanceCorrectionController::class, 'store']);
    Route::get('/attendance/corrections/pending-review', [AttendanceCorrectionController::class, 'pendingReview']);
    Route::get('/attendance/corrections/my-reviews', [AttendanceCorrectionController::class, 'myReviews']);
    Route::get('/attendance/corrections/{id}', [AttendanceCorrectionController::class, 'show']);
    Route::put('/attendance/corrections/{id}/review', [AttendanceCorrectionController::class, 'review']);
    Route::get('/admin/corrections', [AttendanceCorrectionController::class, 'adminIndex']);

    // Dinas Luar
    Route::get('/dinas-luar', [DinasLuarController::class, 'index']);
    Route::post('/dinas-luar', [DinasLuarController::class, 'store']);
    Route::get('/dinas-luar/approved-active', [DinasLuarController::class, 'approvedActive']);
    Route::get('/dinas-luar/absen-records', [DinasLuarController::class, 'absenRecords']);
    Route::get('/dinas-luar/pending-review', [DinasLuarController::class, 'pendingReview']);
    Route::get('/dinas-luar/my-reviews', [DinasLuarController::class, 'myReviews']);
    Route::put('/dinas-luar/{id}/review', [DinasLuarController::class, 'review']);
    Route::post('/dinas-luar/{id}/absen', [DinasLuarController::class, 'absen']);

    // Dashboard Endpoints
    Route::get('/dashboard/recent-updates', [DashboardController::class, 'recentUpdates']);
    Route::get('/dashboard/news', [DashboardController::class, 'news']);

    // Performance Endpoints
    Route::get('/performance/overview', [PerformanceController::class, 'overview']);
    Route::get('/performance/kpis', [PerformanceController::class, 'kpis']);
    Route::get('/performance/kpis/{id}', [PerformanceController::class, 'kpi']);
    Route::get('/performance/feedbacks', [PerformanceController::class, 'feedbacks']);
    Route::get('/performance/feedbacks/{id}', [PerformanceController::class, 'feedback']);
    Route::post('/performance/feedbacks/{id}/acknowledge', [PerformanceController::class, 'acknowledge']);
});
