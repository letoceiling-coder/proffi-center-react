<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;

class AdminMenu
{
    public function getMenu(?User $user = null): Collection
    {
        $menu = collect([
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
