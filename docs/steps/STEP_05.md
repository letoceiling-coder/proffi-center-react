# Шаг 5 — Admin Vue CMS

Цель: реализовать /admin (Vue) для управления контентом сайта — CRUD по модулям из docs/ADMIN_MODULES.md в указанном порядке. Без новых сущностей/полей; только cms_media/cms_media_files/cms_mediables для медиа; site_id везде NOT NULL.

---

## Порядок реализации (обязательный)

1. **Multi-site:** Regions, Cities, Sites, SiteContacts  
2. **CMS Media:** cms_media, cms_media_files, прикрепление через cms_mediables  
3. **Content:** Pages, Services, ProductCategories, Products, ContentBlocks  
4. **SEO:** SeoMeta, SeoSettings, Redirects  
5. **Menus:** Menus, MenuItems  
6. **Schema blocks:** SchemaBlocks  
7. **Reviews:** Reviews, ReviewMedia  

---

## Статус подшагов

| Подшаг | Описание | Документ | Статус |
|--------|----------|----------|--------|
| 5.1 | Multi-site: Regions, Cities, Sites, SiteContacts | [STEP_05_01.md](STEP_05_01.md) | ✅ Сделано |
| 5.2 | CMS Media library | [STEP_05_02.md](STEP_05_02.md) | ✅ Сделано |
| 5.3 | Content: Pages, Services, ProductCategories, Products, ContentBlocks | [STEP_05_03.md](STEP_05_03.md) | ✅ Сделано |
| 5.4 | SEO: SeoMeta, SeoSettings, Redirects | — | ⏳ Осталось |
| 5.5 | Menus: Menus, MenuItems | — | ⏳ Осталось |
| 5.6 | Schema blocks, Reviews | — | ⏳ Осталось |
| 5.7 | Итоговая проверка, тесты, команды | — | ⏳ Осталось |

---

## Команды проверки (по мере готовности)

```bash
# Тесты
php artisan test

# Маршруты CMS
php artisan route:list --path=cms

# Сборка фронта админки
npm run build
```

Ручная проверка: вход в /admin, прохождение по разделам (Регионы, Города, Сайты, Контакты сайта, Медиатека CMS) — список, создание, редактирование, удаление.
