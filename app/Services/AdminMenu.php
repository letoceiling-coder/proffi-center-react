<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;

class AdminMenu
{
    public function getMenu(?User $user = null): Collection
    {
        $menu = collect([
            ['title' => 'Регионы', 'route' => 'admin.cms.regions', 'icon' => 'map', 'roles' => ['admin', 'manager']],
            ['title' => 'Города', 'route' => 'admin.cms.cities', 'icon' => 'building', 'roles' => ['admin', 'manager']],
            ['title' => 'Сайты', 'route' => 'admin.cms.sites', 'icon' => 'globe', 'roles' => ['admin', 'manager']],
            ['title' => 'Контакты сайта', 'route' => 'admin.cms.site-contacts', 'icon' => 'phone', 'roles' => ['admin', 'manager']],
            ['title' => 'Страницы', 'route' => 'admin.cms.pages', 'icon' => 'file-text', 'roles' => ['admin', 'manager']],
            ['title' => 'Услуги', 'route' => 'admin.cms.services', 'icon' => 'briefcase', 'roles' => ['admin', 'manager']],
            ['title' => 'Категории товаров', 'route' => 'admin.cms.product-categories', 'icon' => 'folder', 'roles' => ['admin', 'manager']],
            ['title' => 'Товары', 'route' => 'admin.cms.products', 'icon' => 'package', 'roles' => ['admin', 'manager']],
            ['title' => 'Медиатека CMS', 'route' => 'admin.cms.media', 'icon' => 'image', 'roles' => ['admin', 'manager']],
            ['title' => 'SEO Настройки', 'route' => 'admin.cms.seo-settings', 'icon' => 'award', 'roles' => ['admin', 'manager']],
            ['title' => 'Редиректы', 'route' => 'admin.cms.redirects', 'icon' => 'tags', 'roles' => ['admin', 'manager']],
            ['title' => 'Меню', 'route' => 'admin.cms.menus', 'icon' => 'menu', 'roles' => ['admin', 'manager']],
            ['title' => 'Микроразметка (Schema)', 'route' => 'admin.cms.schema-blocks', 'icon' => 'tags', 'roles' => ['admin', 'manager']],
            ['title' => 'Отзывы', 'route' => 'admin.cms.reviews', 'icon' => 'star', 'roles' => ['admin', 'manager']],
            ['title' => 'Медиа', 'route' => 'admin.media', 'icon' => 'image', 'roles' => ['admin', 'manager']],
            ['title' => 'Уведомления', 'route' => 'admin.notifications', 'icon' => 'bell', 'roles' => ['admin', 'manager', 'user']],
            ['title' => 'Пользователи', 'route' => 'admin.users', 'icon' => 'users', 'roles' => ['admin']],
            ['title' => 'Роли', 'route' => 'admin.roles', 'icon' => 'shield', 'roles' => ['admin']],
            ['title' => 'Боты', 'route' => 'admin.bots', 'icon' => 'bot', 'roles' => ['admin']],
        ]);

        if (!$user) {
            return collect([]);
        }

        $userRoles = $user->roles->pluck('slug')->toArray();

        return $menu->map(function ($item) use ($userRoles) {
            if (!empty($item['roles']) && !$this->hasAccess($userRoles, $item['roles'])) {
                return null;
            }
            if (isset($item['children'])) {
                $item['children'] = collect($item['children'])->filter(function ($child) use ($userRoles) {
                    return empty($child['roles']) || $this->hasAccess($userRoles, $child['roles']);
                })->values()->toArray();
                if (empty($item['children'])) {
                    return null;
                }
            }
            return $item;
        })->filter()->values();
    }

    protected function hasAccess(array $userRoles, array $requiredRoles): bool
    {
        return !empty(array_intersect($userRoles, $requiredRoles));
    }

    public function getMenuJson(?User $user = null): array
    {
        return $this->getMenu($user)->toArray();
    }
}
