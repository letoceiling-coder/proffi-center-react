<?php

use App\Http\Controllers\Api\V1\Public\RobotsController;
use App\Http\Controllers\Api\V1\Public\SitemapController;
use App\Http\Controllers\SeoLandingController;
use App\Services\ServerSeoService;
use App\Services\SiteResolverService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SEO: robots.txt и sitemap.xml в корне сайта (для индексации)
|--------------------------------------------------------------------------
*/
Route::get('robots.txt', [RobotsController::class, 'index']);
Route::get('sitemap.xml', [SitemapController::class, 'index']);

/*
|--------------------------------------------------------------------------
| SEO landing routes: серверные meta + минимальный контент для ботов
|--------------------------------------------------------------------------
*/
Route::get('/', [SeoLandingController::class, 'showHome'])->name('home');
Route::get('/uslugi/{slug}', [SeoLandingController::class, 'showService'])->name('seo.service');
Route::get('{pathKey}', [SeoLandingController::class, 'showStatic'])
    ->whereIn('pathKey', ServerSeoService::getStaticPathKeys())
    ->name('seo.static');
Route::get('/{slug}', [SeoLandingController::class, 'showPage'])
    ->where('slug', '[^/]+')
    ->name('seo.page');

/*
|--------------------------------------------------------------------------
| Калькулятор (Vue SPA из репозитория cieling-calc)
|--------------------------------------------------------------------------
*/
Route::get('/calc', function () {
    return response()->file(public_path('calc/index.html'));
})->name('calc');
Route::get('/calc/{path}', function (string $path) {
    $file = public_path('calc/' . $path);
    if (File::exists($file) && File::isFile($file)) {
        return response()->file($file);
    }
    return response()->file(public_path('calc/index.html'));
})->where('path', '.*')->name('calc.any');

/*
|--------------------------------------------------------------------------
| Админ-панель (Vue/JS SPA)
|--------------------------------------------------------------------------
*/
Route::get('/admin', function () {
    return view('admin');
})->name('admin');
Route::get('/admin/login', function () {
    return view('admin');
});
Route::get('/admin/{any}', function () {
    return view('admin');
})->where('any', '.*')->name('admin.any');

/*
|--------------------------------------------------------------------------
| Fallback для клиентского роутинга React (все остальные GET не /api/*)
|--------------------------------------------------------------------------
*/
Route::get('/{any}', function (Request $request) {
    $site = app(SiteResolverService::class)->resolveByHost(
        $request->query('host') ?? $request->header('X-Forwarded-Host') ?? $request->getHost() ?: 'localhost'
    );
    $seo = app(ServerSeoService::class)->buildDefault($site, '/' . $request->path());
    return view('layouts.seo-spa', ['seo' => $seo, 'seoBodyContent' => '']);
})->where('any', '^(?!api|admin|build|css|images|vite\.svg|favicon\.svg|up).*$')->name('spa.fallback');
