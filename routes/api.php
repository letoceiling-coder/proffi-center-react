<?php

use App\Http\Controllers\Api\AdminMenuController;
use App\Http\Controllers\Api\BotController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\FolderController;
use App\Http\Controllers\Api\V1\MediaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/telegram/webhook/{id}', [BotController::class, 'handleWebhook']);

Route::prefix('v1')->group(function () {
    Route::get('/ping', fn () => response()->json(['message' => 'API v1 ok', 'timestamp' => now()->toIso8601String()]));

    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return response()->json(['user' => $request->user()->load('roles')]);
        });
        Route::post('/logout', [AuthController::class, 'logout']);

        Route::get('/admin/menu', [AdminMenuController::class, 'index']);

        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/all', [NotificationController::class, 'all']);
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);

        Route::get('folders/tree/all', [FolderController::class, 'tree']);
        Route::post('folders/update-positions', [FolderController::class, 'updatePositions']);
        Route::post('folders/{id}/restore', [FolderController::class, 'restore']);
        Route::apiResource('folders', FolderController::class);

        Route::post('media/{id}/restore', [MediaController::class, 'restore']);
        Route::delete('media/trash/empty', [MediaController::class, 'emptyTrash']);
        Route::apiResource('media', MediaController::class);

        Route::middleware('admin')->group(function () {
            Route::apiResource('roles', RoleController::class);
            Route::apiResource('users', UserController::class);
            Route::apiResource('bots', BotController::class);
            Route::get('bots/{id}/check-webhook', [BotController::class, 'checkWebhook']);
            Route::post('bots/{id}/register-webhook', [BotController::class, 'registerWebhook']);
        });
    });
});
