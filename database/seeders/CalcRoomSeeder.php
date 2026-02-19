<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CalcRoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            ['name' => 'Спальня',   'sort' => 1],
            ['name' => 'Гостиная',  'sort' => 2],
            ['name' => 'Кухня',     'sort' => 3],
            ['name' => 'Детская',   'sort' => 4],
            ['name' => 'Прихожая',  'sort' => 5],
            ['name' => 'Ванная',    'sort' => 6],
            ['name' => 'Кабинет',   'sort' => 7],
            ['name' => 'Другое',    'sort' => 8],
        ];

        foreach ($rooms as $room) {
            DB::table('calc_rooms')->updateOrInsert(
                ['name' => $room['name']],
                array_merge($room, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
