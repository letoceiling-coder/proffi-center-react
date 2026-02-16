<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SPA: React-приложение на главную и все не-API маршруты
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return view('spa');
})->name('home');

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
Route::get('/{any}', function () {
    return view('spa');
})->where('any', '^(?!api|admin|build|css|images|vite\.svg|favicon\.svg|up).*$')->name('spa.fallback');
