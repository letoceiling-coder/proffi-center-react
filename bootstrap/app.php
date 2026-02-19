<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: [
            'api/calc/*',
        ]);
        $middleware->alias([
            'admin'     => \App\Http\Middleware\EnsureUserIsAdmin::class,
            'noindex'   => \App\Http\Middleware\NoindexRobotsHeader::class,
            'calc.auth' => \App\Http\Middleware\CalcAuth::class,
        ]);
        $middleware->appendToGroup('api', [\App\Http\Middleware\NoindexRobotsHeader::class]);
        $middleware->appendToGroup('web', [\App\Http\Middleware\NormalizeSeoUrl::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
