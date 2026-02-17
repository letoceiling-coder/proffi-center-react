<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Подписчики на уведомления о заявках с форм.
 * Добавляются при отправке боту команды /start.
 */
class TelegramFormSubscriber extends Model
{
    protected $table = 'telegram_form_subscribers';

    protected $fillable = ['chat_id', 'username', 'first_name'];

    /**
     * Все chat_id для рассылки заявок и отзывов.
     *
     * @return array<int, string>
     */
    public static function allChatIds(): array
    {
        return self::query()->pluck('chat_id')->map(fn ($id) => (string) $id)->values()->all();
    }
}
