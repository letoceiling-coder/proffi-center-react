<?php

use App\Http\Controllers\Api\V1\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Public routes
    Route::get('/ping', fn () => response()->json(['message' => 'API v1 ok', 'timestamp' => now()->toIso8601String()]));

    // Auth
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        });
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});
