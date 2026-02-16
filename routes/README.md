# Маршруты приложения

## Сайт (OpenServer: http://proffi-center.loc/)

- **Корень и SPA:** `GET /` и любой `GET /{path}` (кроме перечисленных ниже) отдают React-приложение (layout `spa.blade.php`).
- **Статика** (отдаётся веб-сервером из `public/`, в Laravel не заходят):
  - `/build/assets/*` — собранные JS/CSS React
  - `/css/*` — стили
  - `/images/*` — изображения
  - `/fonts/*` — шрифты

## API v1 (префикс `/api/v1`)

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/v1/ping` | Проверка API (публичный) |
| POST | `/api/v1/login` | Вход (email, password) |
| POST | `/api/v1/register` | Регистрация (name, email, password, password_confirmation) |
| GET | `/api/v1/user` | Текущий пользователь (требуется `Authorization: Bearer {token}`) |
| POST | `/api/v1/logout` | Выход (требуется Bearer token) |

Дополнительно:
- `GET /sanctum/csrf-cookie` — cookie для SPA-аутентификации (при необходимости).

## Сборка фронтенда под прод

Из корня проекта:

```powershell
.\scripts\build-frontend.ps1
```

Скрипт запускает `npm run build` в `frontend/` и копирует результат в `public/build/assets`, `public/css`, при наличии — `public/fonts`.
