# STEP 08 — Клиенты и чертежи калькулятора

**Цель:** При входе в `/calc` отображать `popup_client` для выбора/создания клиента.
Сохранять данные клиентов и их чертежей в БД, привязывая к Telegram-пользователю.

---

## Архитектура

```
Telegram user (сессия: telegram_user.id)
       │
       │ 1:N
       ▼
calc_clients (id, telegram_id, name, phone)
       │
       │ 1:N
       ▼
calc_client_addresses (id, client_id, address)
       │
       │ 1:N  ────────────────────────────────┐
       ▼                                       │
calc_drawings (id, client_id, address_id, ...) │
       │                                       │
       │ 1:N                                   │
       ▼                                       │
calc_drawing_images (PNG файлы)        calc_rooms (справочник)
```

### 4 изображения из sketch.js

| Переменная | Тип | Описание |
|---|---|---|
| `window.png__img` | `canvas.toDataURL()` PNG | Снимок ДО расчёта |
| `window.png_img` | `canvas.toDataURL()` PNG | Финальный снимок ПОСЛЕ расчёта |
| `window.cut_img` | `sketch.generateSVG(2,...)` SVG | Чертёж для резки |
| `window.calc_img` | `sketch.generateSVG(1,...)` SVG | Расчётный чертёж с размерами |

SVG хранятся в `calc_drawings` (текст, не файл). PNG — в `calc_drawing_images` (файлы в storage).

---

## Полный чеклист реализации

### Шаг 1 — База данных: миграции
- [ ] `2026_02_19_300001_create_calc_rooms_table` — справочник типов помещений
- [ ] `2026_02_19_300002_create_calc_clients_table` — клиенты
- [ ] `2026_02_19_300003_create_calc_client_addresses_table` — адреса клиентов
- [ ] `2026_02_19_300004_create_calc_drawings_table` — чертежи
- [ ] `2026_02_19_300005_create_calc_drawing_images_table` — PNG изображения

### Шаг 2 — Модели Laravel
- [ ] `App\Models\CalcRoom`
- [ ] `App\Models\CalcClient` — hasMany addresses, hasMany drawings
- [ ] `App\Models\CalcClientAddress` — belongsTo client, hasMany drawings
- [ ] `App\Models\CalcDrawing` — belongsTo client/address/room, hasMany images
- [ ] `App\Models\CalcDrawingImage` — belongsTo drawing

### Шаг 3 — Сидер
- [ ] `database/seeders/CalcRoomSeeder.php` — стандартные типы помещений
- [ ] Регистрация в `DatabaseSeeder`

### Шаг 4 — Middleware
- [ ] `App\Http\Middleware\CalcAuth` — проверка `session('telegram_user')`
- [ ] Регистрация алиаса `calc.auth` в `bootstrap/app.php`

### Шаг 5 — Контроллеры Laravel
- [ ] `CalcClientController` — CRUD (index/store/show/update/destroy)
- [ ] `CalcDrawingController` — index/store/show/update/destroy + images
- [ ] Обновить `TelegramLoginController::rooms()` — возвращать реальные комнаты

### Шаг 6 — Маршруты web.php
- [ ] `GET  /api/calc/clients`
- [ ] `POST /api/calc/clients`
- [ ] `GET  /api/calc/clients/{id}`
- [ ] `PUT  /api/calc/clients/{id}`
- [ ] `GET  /api/calc/clients/{id}/addresses`
- [ ] `POST /api/calc/clients/{id}/addresses`
- [ ] `GET  /api/calc/drawings`
- [ ] `GET  /api/calc/clients/{id}/drawings`
- [ ] `POST /api/calc/drawings`
- [ ] `GET  /api/calc/drawings/{id}`
- [ ] `DELETE /api/calc/drawings/{id}`
- [ ] `POST /api/calc/drawings/{id}/images`

### Шаг 7 — php artisan migrate + тест
- [ ] Запустить `php artisan migrate`
- [ ] Проверить таблицы в БД
- [ ] Запустить `php artisan db:seed --class=CalcRoomSeeder`
- [ ] Проверить данные в `calc_rooms`

### Шаг 8 — Frontend: appStore.js singleton
- [ ] Конвертировать в singleton (`let _instance = null`)
- [ ] Добавить `currentClient`, `currentAddress`, `currentRoomId`
- [ ] Добавить `drawings`, `clientsList`, `fetchClients`

### Шаг 9 — Frontend: useClients.js → API
- [ ] `fetchClients()` → `GET /api/calc/clients`
- [ ] `createClient(data)` → `POST /api/calc/clients`
- [ ] `fetchAddresses(clientId)` → `GET /api/calc/clients/{id}/addresses`
- [ ] `createAddress(clientId, address)` → `POST /api/calc/clients/{id}/addresses`
- [ ] Убрать localStorage как основное хранилище (оставить только для черновиков)

### Шаг 10 — Frontend: Main2Section popup_client
- [ ] Показывать попап ТОЛЬКО если `!store.currentClient`
- [ ] 2-шаговый UX: (1) клиент → (2) адрес + помещение
- [ ] Кнопка «Сменить клиента» в header чертёжника
- [ ] `saveAndClose` — собрать все 4 изображения + `raw_drawing_data`
- [ ] `POST /api/calc/drawings` + `POST /api/calc/drawings/{id}/images`
- [ ] Обновить `#calc_id` после сохранения

### Шаг 11 — Финальное тестирование
- [ ] Войти через Telegram → открыть /calc
- [ ] Создать нового клиента → появится в БД
- [ ] Нарисовать чертёж → сохранить → данные в `calc_drawings`
- [ ] PNG изображения сохранены в `storage/app/public/calc/drawings/`
- [ ] Повторный вход → список клиентов загружается
- [ ] Выбрать существующего клиента → чертёжник открывается без попапа

---

## Схема таблиц

### `calc_rooms`
| Поле | Тип |
|---|---|
| id | bigint PK |
| name | string |
| sort | int default 0 |
| timestamps | — |

**Данные:** Спальня, Гостиная, Кухня, Детская, Прихожая, Ванная, Кабинет, Другое

### `calc_clients`
| Поле | Тип | Описание |
|---|---|---|
| id | bigint PK | |
| telegram_id | string, index | ID пользователя Telegram |
| name | string | Имя клиента |
| phone | string, nullable | Телефон |
| deleted_at | timestamp | SoftDeletes |
| timestamps | — | |

### `calc_client_addresses`
| Поле | Тип | Описание |
|---|---|---|
| id | bigint PK | |
| client_id | FK calc_clients | |
| address | string | Адрес объекта |
| deleted_at | timestamp | SoftDeletes |
| timestamps | — | |

### `calc_drawings`
| Поле | Тип | Описание |
|---|---|---|
| id | bigint PK | |
| client_id | FK calc_clients | |
| address_id | FK nullable | |
| room_id | FK calc_rooms nullable | Тип помещения |
| room_note | string nullable | «Спальня хозяев» |
| title | string nullable | Произвольное название |
| status | enum(draft/saved/estimated) | |
| area | decimal(8,4) | Площадь м² |
| perimeter | decimal(8,4) | Периметр м |
| perimeter_shrink | decimal(8,4) | Периметр с усадкой м |
| corners_count | int | Углов |
| canvas_area | decimal(8,4) nullable | Площадь полотна м² |
| material_name | string nullable | Название материала |
| material_price | decimal(8,2) nullable | Цена м² |
| mount_price | decimal(8,2) nullable | Цена монтажа |
| canvas_angle | int nullable | Угол поворота ° |
| has_seams | boolean default false | |
| seams_count | int default 0 | |
| lighting_count | int default 0 | |
| drawing_data | JSON nullable | Полный optimized_drawing_data |
| raw_drawing_data | JSON nullable | Сырые координаты (для редактирования) |
| raw_cuts_json | JSON nullable | Данные о разрезах |
| goods_data | JSON nullable | Товары |
| works_data | JSON nullable | Работы |
| cut_img_svg | LONGTEXT nullable | SVG для резки |
| calc_img_svg | LONGTEXT nullable | SVG с размерами |
| deleted_at | timestamp | SoftDeletes |
| timestamps | — | |

### `calc_drawing_images`
| Поле | Тип | Описание |
|---|---|---|
| id | bigint PK | |
| drawing_id | FK calc_drawings | |
| type | enum(png/png_alt) | png_img / png__img |
| path | string | Путь в storage |
| disk | string default public | |
| timestamps | — | |

---

## API контракт

### `GET /api/calc/clients`
```json
[{ "id": 1, "name": "Иванов И.И.", "phone": "+7...", "addresses_count": 2, "drawings_count": 5 }]
```

### `POST /api/calc/clients`
```json
{ "name": "Иванов", "phone": "+79001234567", "address": "ул. Ленина 1", "room_id": 1 }
```
Ответ: `{ "client": {...}, "address": {...} }`

### `POST /api/calc/drawings`
```json
{
  "client_id": 1, "address_id": 1, "room_id": 2, "room_note": "Спальня",
  "drawing_data": {...},
  "raw_drawing_data": {...},
  "raw_cuts_json": [...],
  "cut_img_svg": "<svg>...</svg>",
  "calc_img_svg": "<svg>...</svg>"
}
```
Ответ: `{ "id": 42, "status": "saved", ... }`

### `POST /api/calc/drawings/{id}/images`
FormData: `type=png|png_alt`, `image` (file)
Ответ: `{ "id": 1, "path": "calc/drawings/42/png.png", "url": "..." }`

---

## Статус реализации

| Шаг | Статус | Дата |
|---|---|---|
| 1. Миграции | ✅ | 2026-02-19 |
| 2. Модели | ✅ | 2026-02-19 |
| 3. Сидер | ✅ | 2026-02-19 |
| 4. Middleware | ✅ | 2026-02-19 |
| 5. Контроллеры | ✅ | 2026-02-19 |
| 6. Маршруты | ✅ | 2026-02-19 |
| 7. migrate + тест (14/14 assertions) | ✅ | 2026-02-19 |
| 8. appStore singleton | ✅ | 2026-02-19 |
| 9. useClients API | ✅ | 2026-02-19 |
| 10. popup_client UX (2-шаговый) | ✅ | 2026-02-19 |
| 11. Финальный тест | ✅ 14/14 тестов | 2026-02-19 |
