# Вход через Telegram для калькулятора (/calc/)

Быстрый вход по кнопке «Login with Telegram» на странице https://proffi-center.ru/calc/ для определения пользователя (без отдельной регистрации).

## Что сделано

- **Backend:** проверка подписи данных от Telegram Login Widget, сохранение пользователя в сессии, эндпоинты для SPA.
- **Frontend (calc):** виджет «Login with Telegram», отображение «Вход: Имя @username» и кнопка «Выйти».

## Настройка в Telegram (BotFather)

1. Создайте бота или используйте существующего: [@BotFather](https://t.me/BotFather).
2. Получите **токен** бота (например `123456:ABC-DEF...`) и сохраните его в `.env`:
   ```env
   TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
   ```
3. Для **Login Widget** нужно разрешить домен:
   - В BotFather выберите бота → **Bot Settings** → **Domain** (или найдите пункт про «Login widget» / «Domain»).
   - Укажите домен **без протокола и слэшей**: `proffi-center.ru`
   - Так виджет будет разрешён на страницах `https://proffi-center.ru/...` (в т.ч. `/calc/`).

4. (Рекомендуется) Задайте в `.env` юзернейм бота (без `@`), чтобы виджет знал, с каким ботом логиниться:
   ```env
   TELEGRAM_BOT_USERNAME=proffi_center_bot
   ```
   Если не задать, виджет на калькуляторе не отобразится (бот не определён).

## Переменные окружения (.env)

| Переменная | Обязательно | Описание |
|------------|-------------|----------|
| `TELEGRAM_BOT_TOKEN` | да | Токен бота из BotFather. |
| `TELEGRAM_BOT_USERNAME` | да (для виджета) | Юзернейм бота без `@`, например `proffi_center_bot`. |

Тот же токен может использоваться для других функций (формы, уведомления и т.д.).

## URL для использования

- **Страница калькулятора:**  
  `https://proffi-center.ru/calc/`

- **Callback после нажатия «Login with Telegram» (настраивать не нужно, только для справки):**  
  `https://proffi-center.ru/auth/telegram-callback`  
  Сюда Telegram перенаправляет пользователя с параметрами; сервер проверяет подпись и записывает данные в сессию, затем редирект обратно на `/calc/`.

- **API для SPA (внутренние):**  
  - `GET /api/calc/config` — конфиг (в т.ч. `telegram_bot_username` для виджета).  
  - `GET /api/calc/me` — текущий пользователь из сессии (401, если не авторизован).  
  - `POST /api/calc/logout` — выход (очистка сессии).

## На сервере (proffi-center.ru, root@89.169.39.244)

Подключитесь по SSH и в каталоге проекта добавьте в `.env` переменные для бота **@proffi_center_bot**:

```bash
ssh root@89.169.39.244
cd /path/to/react-proffi   # или ваш путь к проекту

# Добавить юзернейм бота (без @)
grep -q 'TELEGRAM_BOT_USERNAME' .env || echo 'TELEGRAM_BOT_USERNAME=proffi_center_bot' >> .env

# Если ещё нет токена — добавьте строку (подставьте токен из BotFather):
# echo 'TELEGRAM_BOT_TOKEN=123456:ABC-DEF...' >> .env

# Перезапустить PHP/очереди при необходимости (зависит от настроек сервера)
# php artisan config:clear
```

Убедитесь, что в `.env` есть:
- `TELEGRAM_BOT_TOKEN=...` (токен из @BotFather для @proffi_center_bot)
- `TELEGRAM_BOT_USERNAME=proffi_center_bot`

В BotFather для бота @proffi_center_bot в **Domain** должно быть указано: `proffi-center.ru`.

## Краткий чек-лист в BotFather

1. Создать/выбрать бота → получить токен → `TELEGRAM_BOT_TOKEN`.
2. В настройках бота указать **Domain**: `proffi-center.ru`.
3. В `.env` (локально и на сервере) добавить `TELEGRAM_BOT_USERNAME=proffi_center_bot`.

После этого на https://proffi-center.ru/calc/ появится кнопка входа через Telegram и быстрый вход будет работать.
