<?php

namespace App\Http\Controllers;

use App\Services\TelegramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Config;

class TelegramLoginController extends Controller
{
    public function __construct(
        protected TelegramService $telegramService
    ) {}

    /**
     * Callback после нажатия "Login with Telegram" в виджете.
     * Проверяет hash, сохраняет пользователя в сессию, редирект на /calc/.
     */
    public function callback(Request $request): RedirectResponse
    {
        $params = $request->query->all();
        $token = Config::get('telegram.bot_token');
        if (! $token) {
            return redirect('/calc/?telegram_error=config');
        }

        $user = $this->telegramService->verifyLoginWidgetHash($token, $params);
        if ($user === null) {
            return redirect('/calc/?telegram_error=invalid');
        }

        $request->session()->put('telegram_user', $user);

        return redirect('/calc/');
    }

    /**
     * Текущий пользователь калькулятора (из сессии). Для SPA /calc/.
     */
    public function me(Request $request): JsonResponse|Response
    {
        $user = $request->session()->get('telegram_user');
        if ($user === null) {
            return response('', 401);
        }

        return response()->json($user);
    }

    /**
     * Выход из аккаунта калькулятора (очистка сессии).
     */
    public function logout(Request $request): Response
    {
        $request->session()->forget('telegram_user');

        return response('', 204);
    }

    /**
     * Публичный конфиг для SPA калькулятора (бот для виджета Telegram Login).
     */
    public function config(): JsonResponse
    {
        $botUsername = Config::get('telegram.bot_username', '');
        return response()->json(['telegram_bot_username' => $botUsername]);
    }
}
