<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bot;
use App\Services\TelegramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class BotController extends Controller
{
    public function __construct(
        protected TelegramService $telegramService
    ) {}

    public function index(): JsonResponse
    {
        $bots = Bot::orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $bots]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'token' => 'required|string',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Ошибка валидации', 'errors' => $validator->errors()], 422);
        }

        try {
            $botInfo = $this->telegramService->getBotInfo($request->token);
            if (!$botInfo['success']) {
                return response()->json(['success' => false, 'message' => $botInfo['message'] ?? 'Не удалось получить информацию о боте'], 400);
            }

            $settings = $request->settings ?? [];
            if ($request->has('webhook')) {
                $allowedUpdates = $request->input('webhook.allowed_updates');
                if (is_string($allowedUpdates)) {
                    $allowedUpdates = array_map('trim', explode(',', $allowedUpdates));
                }
                $settings['webhook'] = [
                    'allowed_updates' => $allowedUpdates ?: config('telegram.webhook.allowed_updates', ['message', 'callback_query']),
                    'max_connections' => $request->input('webhook.max_connections', config('telegram.webhook.max_connections', 40)),
                ];
                if ($request->filled('webhook.secret_token')) {
                    $settings['webhook']['secret_token'] = $request->input('webhook.secret_token');
                }
            }

            $bot = Bot::create([
                'name' => $request->name,
                'token' => $request->token,
                'username' => $botInfo['data']['username'] ?? null,
                'webhook_url' => null,
                'webhook_registered' => false,
                'welcome_message' => $request->welcome_message ?? null,
                'settings' => $settings,
                'is_active' => true,
            ]);

            $webhookUrl = url('/api/telegram/webhook/' . $bot->id);
            $webhookOptions = [
                'allowed_updates' => $settings['webhook']['allowed_updates'] ?? config('telegram.webhook.allowed_updates', ['message', 'callback_query']),
                'max_connections' => $settings['webhook']['max_connections'] ?? 40,
            ];
            if (isset($settings['webhook']['secret_token'])) {
                $webhookOptions['secret_token'] = $settings['webhook']['secret_token'];
            }

            $webhookResult = $this->telegramService->setWebhook($bot->token, $webhookUrl, $webhookOptions);
            $bot->webhook_url = $webhookUrl;
            $bot->webhook_registered = $webhookResult['success'] ?? false;
            $bot->save();

            return response()->json(['success' => true, 'message' => 'Бот успешно зарегистрирован', 'data' => $bot], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Ошибка при создании бота: ' . $e->getMessage()], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        $bot = Bot::findOrFail($id);
        return response()->json(['success' => true, 'data' => $bot]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $bot = Bot::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'token' => 'sometimes|required|string',
            'welcome_message' => 'nullable|string',
            'settings' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Ошибка валидации', 'errors' => $validator->errors()], 422);
        }

        try {
            if ($request->has('token') && $request->token !== $bot->token) {
                $botInfo = $this->telegramService->getBotInfo($request->token);
                if (!$botInfo['success']) {
                    return response()->json(['success' => false, 'message' => $botInfo['message'] ?? 'Не удалось получить информацию о боте'], 400);
                }
                $webhookUrl = url('/api/telegram/webhook/' . $bot->id);
                $webhookOptions = [
                    'allowed_updates' => config('telegram.webhook.allowed_updates', ['message', 'callback_query']),
                    'max_connections' => 40,
                ];
                $webhookResult = $this->telegramService->setWebhook($request->token, $webhookUrl, $webhookOptions);
                $bot->webhook_url = $webhookUrl;
                $bot->webhook_registered = $webhookResult['success'] ?? false;
                $bot->username = $botInfo['data']['username'] ?? null;
            }
            $bot->update($request->only(['name', 'token', 'welcome_message', 'settings', 'is_active']));
            return response()->json(['success' => true, 'message' => 'Бот успешно обновлен', 'data' => $bot->fresh()]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Ошибка при обновлении бота: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        $bot = Bot::findOrFail($id);
        try {
            $this->telegramService->deleteWebhook($bot->token);
            $bot->delete();
            return response()->json(['success' => true, 'message' => 'Бот успешно удален']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Ошибка при удалении бота: ' . $e->getMessage()], 500);
        }
    }

    public function checkWebhook(string $id): JsonResponse
    {
        $bot = Bot::findOrFail($id);
        try {
            $result = $this->telegramService->getWebhookInfo($bot->token);
            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Ошибка при проверке webhook: ' . $e->getMessage()], 500);
        }
    }

    public function registerWebhook(Request $request, string $id): JsonResponse
    {
        $bot = Bot::findOrFail($id);
        try {
            $webhookUrl = url('/api/telegram/webhook/' . $bot->id);
            $settings = $bot->settings ?? [];
            $allowedUpdates = $request->input('allowed_updates') ?? $settings['webhook']['allowed_updates'] ?? null;
            if (is_string($allowedUpdates)) {
                $allowedUpdates = array_map('trim', explode(',', $allowedUpdates));
            }
            $webhookOptions = [
                'allowed_updates' => $allowedUpdates ?: config('telegram.webhook.allowed_updates', ['message', 'callback_query']),
                'max_connections' => $request->input('max_connections', $settings['webhook']['max_connections'] ?? 40),
            ];
            if ($token = $request->input('secret_token', $settings['webhook']['secret_token'] ?? null)) {
                $webhookOptions['secret_token'] = $token;
            }
            $result = $this->telegramService->setWebhook($bot->token, $webhookUrl, $webhookOptions);
            if ($result['success']) {
                $bot->update(['webhook_url' => $webhookUrl, 'webhook_registered' => true]);
            }
            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'] ?? ($result['success'] ? 'Webhook успешно зарегистрирован' : 'Ошибка регистрации webhook'),
                'data' => $result['data'] ?? null,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Ошибка при регистрации webhook: ' . $e->getMessage()], 500);
        }
    }

    public function handleWebhook(Request $request, string $id): JsonResponse
    {
        try {
            $bot = Bot::findOrFail($id);
            if (!empty($bot->settings['webhook']['secret_token'])) {
                $secretToken = $request->header('X-Telegram-Bot-Api-Secret-Token');
                if ($secretToken !== $bot->settings['webhook']['secret_token']) {
                    return response()->json(['error' => 'Invalid secret token'], 403);
                }
            }
            $update = $request->all();
            if (isset($update['message'])) {
                $message = $update['message'];
                $chatId = $message['chat']['id'] ?? null;
                $text = $message['text'] ?? null;
                if ($text === '/start' || str_starts_with((string) $text, '/start')) {
                    if ($bot->welcome_message) {
                        $this->telegramService->sendMessage($bot->token, $chatId, $bot->welcome_message);
                    }
                }
            }
            return response()->json(['ok' => true], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Bot not found', ['bot_id' => $id]);
            return response()->json(['error' => 'Bot not found'], 404);
        } catch (\Exception $e) {
            Log::error('Webhook error', ['bot_id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }
}
