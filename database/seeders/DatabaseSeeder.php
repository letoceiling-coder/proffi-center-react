<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call(RoleSeeder::class);
        $this->call(BootstrapCmsSeeder::class);
        $this->call(BootstrapContentSeeder::class);
        $this->call(PotolkiPoKomnatamSeeder::class);
        $this->call(VidyPotolkovPagesSeeder::class);

        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User', 'password' => bcrypt('password')]
        );

        $adminRole = Role::where('slug', 'admin')->first();
        if ($adminRole && !$user->roles()->where('roles.id', $adminRole->id)->exists()) {
            $user->roles()->attach($adminRole->id);
        }
    }
}
