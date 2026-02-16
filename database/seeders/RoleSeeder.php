<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'Администратор', 'slug' => 'admin', 'description' => 'Полный доступ'],
            ['name' => 'Менеджер', 'slug' => 'manager', 'description' => 'Доступ к медиа и уведомлениям'],
            ['name' => 'Пользователь', 'slug' => 'user', 'description' => 'Базовый доступ'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['slug' => $role['slug']],
                $role
            );
        }
    }
}
