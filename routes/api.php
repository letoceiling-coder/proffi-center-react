<?php

use App\Http\Controllers\Api\AdminMenuController;
use App\Http\Controllers\Api\BotController;
use App\Http\Controllers\Api\Cms\CityController;
use App\Http\Controllers\Api\Cms\CmsMediaController;
use App\Http\Controllers\Api\Cms\ContentBlockController;
use App\Http\Controllers\Api\Cms\MenuController;
use App\Http\Controllers\Api\Cms\MenuItemController;
use App\Http\Controllers\Api\Cms\PageController;
use App\Http\Controllers\Api\Cms\ProductCategoryController;
use App\Http\Controllers\Api\Cms\ProductController;
use App\Http\Controllers\Api\Cms\RedirectController;
use App\Http\Controllers\Api\Cms\RegionController;
use App\Http\Controllers\Api\Cms\ReviewController;
use App\Http\Controllers\Api\Cms\SchemaBlockController;
use App\Http\Controllers\Api\Cms\SeoMetaController;
use App\Http\Controllers\Api\Cms\SeoSettingController;
use App\Http\Controllers\Api\Cms\ServiceController;
use App\Http\Controllers\Api\Cms\SiteContactController;
use App\Http\Controllers\Api\Cms\SiteController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\FolderController;
use App\Http\Controllers\Api\V1\MediaController;
use App\Http\Controllers\Api\V1\Public\MenuController as PublicMenuController;
use App\Http\Controllers\Api\V1\Public\PageController as PublicPageController;
use App\Http\Controllers\Api\V1\Public\ProductCategoryController as PublicProductCategoryController;
use App\Http\Controllers\Api\V1\Public\ProductController as PublicProductController;
use App\Http\Controllers\Api\V1\Public\RedirectsController;
use App\Http\Controllers\Api\V1\Public\ReviewsController;
use App\Http\Controllers\Api\V1\Public\RobotsController;
use App\Http\Controllers\Api\V1\Public\ServiceController as PublicServiceController;
use App\Http\Controllers\Api\V1\Public\SiteController as PublicSiteController;
use App\Http\Controllers\Api\V1\Public\SitemapController;
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

    // Public API (no auth)
    Route::get('/site/resolve', [PublicSiteController::class, 'resolve']);
    Route::get('/menu/{key}', [PublicMenuController::class, 'show'])->where('key', 'header|footer');
    Route::get('/page/{slug}', [PublicPageController::class, 'show']);
    Route::get('/service/{slug}', [PublicServiceController::class, 'show']);
    Route::get('/product-category/{slug}', [PublicProductCategoryController::class, 'show']);
    Route::get('/product/{slug}', [PublicProductController::class, 'show']);
    Route::get('/reviews', [ReviewsController::class, 'index']);
    Route::get('/redirects/check', [RedirectsController::class, 'check']);
    Route::get('/robots.txt', [RobotsController::class, 'index']);
    Route::get('/sitemap.xml', [SitemapController::class, 'index']);

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

        Route::prefix('cms')->group(function () {
            Route::apiResource('regions', RegionController::class);
            Route::apiResource('cities', CityController::class);
            Route::apiResource('sites', SiteController::class);
            Route::apiResource('site-contacts', SiteContactController::class)->parameters(['site-contacts' => 'site_contact']);
            Route::post('cms-media/upload', [CmsMediaController::class, 'upload']);
            Route::post('cms-media/{cms_media}/attach', [CmsMediaController::class, 'attach']);
            Route::post('cms-media/{cms_media}/detach', [CmsMediaController::class, 'detach']);
            Route::apiResource('cms-media', CmsMediaController::class)->parameters(['cms-media' => 'cms_media']);

            Route::apiResource('pages', PageController::class);
            Route::post('pages/{page}/publish', [PageController::class, 'publish']);
            Route::post('pages/{page}/unpublish', [PageController::class, 'unpublish']);
            Route::get('pages/{page}/blocks', [ContentBlockController::class, 'indexForPage']);
            Route::post('pages/{page}/blocks', [ContentBlockController::class, 'storeForPage']);

            Route::apiResource('services', ServiceController::class);
            Route::post('services/{service}/publish', [ServiceController::class, 'publish']);
            Route::post('services/{service}/unpublish', [ServiceController::class, 'unpublish']);
            Route::get('services/{service}/blocks', [ContentBlockController::class, 'indexForService']);
            Route::post('services/{service}/blocks', [ContentBlockController::class, 'storeForService']);

            Route::apiResource('product-categories', ProductCategoryController::class)->parameters(['product-categories' => 'product_category']);
            Route::apiResource('products', ProductController::class);
            Route::post('products/{product}/publish', [ProductController::class, 'publish']);
            Route::post('products/{product}/unpublish', [ProductController::class, 'unpublish']);
            Route::post('products/{product}/gallery', [ProductController::class, 'syncGallery']);
            Route::get('products/{product}/blocks', [ContentBlockController::class, 'indexForProduct']);
            Route::post('products/{product}/blocks', [ContentBlockController::class, 'storeForProduct']);

            Route::put('blocks/{block}', [ContentBlockController::class, 'update'])->name('cms.blocks.update');
            Route::delete('blocks/{block}', [ContentBlockController::class, 'destroy'])->name('cms.blocks.destroy');
            Route::post('blocks/{block}/move', [ContentBlockController::class, 'move'])->name('cms.blocks.move');

            Route::get('seo-settings', [SeoSettingController::class, 'index'])->name('cms.seo-settings.index');
            Route::get('seo-settings/{seo_setting}', [SeoSettingController::class, 'show'])->name('cms.seo-settings.show');
            Route::put('seo-settings/{seo_setting}', [SeoSettingController::class, 'update'])->name('cms.seo-settings.update');

            Route::get('{entity}/{id}/seo-meta', [SeoMetaController::class, 'show'])->where('entity', 'pages|services|product-categories|products')->name('cms.seo-meta.show');
            Route::put('{entity}/{id}/seo-meta', [SeoMetaController::class, 'update'])->where('entity', 'pages|services|product-categories|products')->name('cms.seo-meta.update');

            Route::apiResource('redirects', RedirectController::class)->parameters(['redirects' => 'redirect']);

            Route::apiResource('menus', MenuController::class);
            Route::get('menus/{menu}/items', [MenuItemController::class, 'index']);
            Route::post('menus/{menu}/items', [MenuItemController::class, 'store']);
            Route::put('menu-items/{menu_item}', [MenuItemController::class, 'update']);
            Route::delete('menu-items/{menu_item}', [MenuItemController::class, 'destroy']);
            Route::post('menu-items/{menu_item}/move', [MenuItemController::class, 'move']);

            Route::get('schema-blocks', [SchemaBlockController::class, 'index']);
            Route::post('schema-blocks', [SchemaBlockController::class, 'store']);
            Route::get('schema-blocks/{schema_block}', [SchemaBlockController::class, 'show']);
            Route::put('schema-blocks/{schema_block}', [SchemaBlockController::class, 'update']);
            Route::delete('schema-blocks/{schema_block}', [SchemaBlockController::class, 'destroy']);

            Route::apiResource('reviews', ReviewController::class);
            Route::post('reviews/{review}/media', [ReviewController::class, 'syncMedia']);
            Route::delete('reviews/{review}/media/{media_id}', [ReviewController::class, 'detachMedia']);
        });

        Route::middleware('admin')->group(function () {
            Route::apiResource('roles', RoleController::class);
            Route::apiResource('users', UserController::class);
            Route::apiResource('bots', BotController::class);
            Route::get('bots/{id}/check-webhook', [BotController::class, 'checkWebhook']);
            Route::post('bots/{id}/register-webhook', [BotController::class, 'registerWebhook']);
        });
    });
});
