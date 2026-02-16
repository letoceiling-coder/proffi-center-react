<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateUser extends Command
{
    protected $signature = 'user:create
                            {--email= : Email пользователя}
                            {--password= : Пароль пользователя}
                            {--name= : Имя пользователя}
                            {--roles=* : Роли пользователя (slug через запятую)}';

    protected $description = 'Создать нового пользователя';

    public function handle(): int
    {
        $email = $this->option('email') ?: 'dsc-23@yandex.ru';
        $password = $this->option('password') ?: '123123123';
        $name = $this->option('name') ?: 'Джон Уик';
        $rolesInput = $this->option('roles');

        if (empty($rolesInput)) {
            $adminRole = Role::firstOrCreate(
                ['slug' => 'admin'],
                ['name' => 'Администратор', 'description' => 'Полный доступ ко всем функциям системы']
            );
            $roles = collect([$adminRole]);
        } else {
            $roleSlugs = is_array($rolesInput) ? $rolesInput : explode(',', $rolesInput[0] ?? '');
            $roles = Role::whereIn('slug', array_map('trim', $roleSlugs))->get();
        }

        $user = User::where('email', $email)->first();

        if ($user) {
            $this->warn("Пользователь с email {$email} уже существует.");
            if (!$this->confirm('Обновить пользователя?')) {
                return 0;
            }
            $user->name = $name;
            $user->password = Hash::make($password);
            $user->save();
        } else {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
            ]);
        }

        $user->roles()->sync($roles->pluck('id'));

        $this->info('Пользователь успешно создан/обновлен:');
        $this->line("Email: {$user->email}");
        $this->line("Имя: {$user->name}");
        $this->line('Роли: ' . $roles->pluck('name')->implode(', '));

        return 0;
    }
}
