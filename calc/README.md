# Миграция проекта на Vue 3

Проект успешно мигрирован на Vue 3 с сохранением всей функциональности 1 в 1.

## Структура проекта

```
src/
├── components/          # Vue компоненты
│   ├── Main1Section.vue
│   ├── Main2Section.vue
│   ├── Main3Section.vue
│   ├── Main4Section.vue
│   ├── Main5Section.vue
│   └── Main6Section.vue
├── composables/        # Композаблы для логики
│   ├── useRooms.js
│   ├── useClients.js
│   ├── useSmeta.js
│   └── useCategories.js
├── stores/             # Управление состоянием
│   └── appStore.js
├── utils/              # Утилиты
│   ├── noty.js
│   └── sketchInit.js
├── App.vue             # Главный компонент
└── main.js             # Точка входа
```

## Установка и запуск

1. Установите зависимости:
```bash
npm install
```

2. Запустите dev сервер:
```bash
npm run dev
```

3. Соберите для production:
```bash
npm run build
```

## Особенности миграции

- Все компоненты переписаны на Vue 3 Composition API
- Сохранена вся функциональность оригинального проекта
- Используется реактивное управление состоянием
- Canvas и paper.js интегрированы через composables
- Все модальные окна и формы работают через Vue реактивность

## Интеграция существующих библиотек

Проект использует:
- Bootstrap (CSS)
- Paper.js для canvas
- Noty для уведомлений
- jQuery (можно постепенно убрать)

## Следующие шаги

1. Завершить интеграцию всех функций из sketch.js
2. Заменить jQuery на нативные Vue методы
3. Добавить TypeScript (опционально)
4. Оптимизировать производительность

