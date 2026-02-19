<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CalcAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->session()->get('telegram_user');

        if (! $user || empty($user['id'])) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->attributes->set('calc_telegram_user', $user);

        return $next($request);
    }
}
