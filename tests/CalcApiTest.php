<?php

namespace Tests;

use App\Models\CalcClient;
use App\Models\CalcClientAddress;
use App\Models\CalcDrawing;
use App\Models\CalcRoom;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CalcApiTest extends TestCase
{
    use RefreshDatabase;

    private array $telegramUser = [
        'id'         => '123456789',
        'first_name' => 'Тест',
        'username'   => 'test_user',
    ];

    private function withCalcSession(): static
    {
        return $this->withSession(['telegram_user' => $this->telegramUser]);
    }

    protected function setUp(): void
    {
        parent::setUp();
        // Создаём типы помещений
        CalcRoom::insert([
            ['name' => 'Спальня',  'sort' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Кухня',    'sort' => 3, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    // ──── GET /api/calc/rooms ────

    public function test_rooms_requires_auth(): void
    {
        $this->getJson('/api/calc/rooms')->assertStatus(401);
    }

    public function test_rooms_returns_list(): void
    {
        $this->withCalcSession()
            ->getJson('/api/calc/rooms')
            ->assertStatus(200)
            ->assertJsonCount(2);
    }

    // ──── GET /api/calc/clients ────

    public function test_clients_requires_auth(): void
    {
        $this->getJson('/api/calc/clients')->assertStatus(401);
    }

    public function test_clients_empty_for_new_user(): void
    {
        $this->withCalcSession()
            ->getJson('/api/calc/clients')
            ->assertStatus(200)
            ->assertJson([]);
    }

    // ──── POST /api/calc/clients ────

    public function test_create_client_without_address(): void
    {
        $response = $this->withCalcSession()
            ->postJson('/api/calc/clients', [
                'name'  => 'Иванов Иван',
                'phone' => '+79001234567',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('client.name', 'Иванов Иван')
            ->assertJsonPath('client.telegram_id', '123456789')
            ->assertJsonPath('address', null);

        $this->assertDatabaseHas('calc_clients', [
            'name'        => 'Иванов Иван',
            'telegram_id' => '123456789',
        ]);
    }

    public function test_create_client_with_address(): void
    {
        $response = $this->withCalcSession()
            ->postJson('/api/calc/clients', [
                'name'    => 'Петров П.П.',
                'phone'   => '+79009876543',
                'address' => 'ул. Ленина 1, кв. 5',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('client.name', 'Петров П.П.')
            ->assertJsonPath('address.address', 'ул. Ленина 1, кв. 5');

        $this->assertDatabaseHas('calc_client_addresses', [
            'address' => 'ул. Ленина 1, кв. 5',
        ]);
    }

    public function test_create_client_requires_name(): void
    {
        $this->withCalcSession()
            ->postJson('/api/calc/clients', ['phone' => '+79001234567'])
            ->assertStatus(422);
    }

    // ──── GET /api/calc/clients (список только своих) ────

    public function test_clients_isolation_between_operators(): void
    {
        // Создаём клиента под другим telegram_id
        CalcClient::create(['telegram_id' => '999999999', 'name' => 'Чужой клиент']);

        // Текущий оператор не должен видеть чужих клиентов
        $this->withCalcSession()
            ->getJson('/api/calc/clients')
            ->assertStatus(200)
            ->assertJson([]);
    }

    // ──── POST /api/calc/clients/{id}/addresses ────

    public function test_add_address_to_client(): void
    {
        $client = CalcClient::create([
            'telegram_id' => '123456789',
            'name'        => 'Сидоров',
        ]);

        $this->withCalcSession()
            ->postJson("/api/calc/clients/{$client->id}/addresses", [
                'address' => 'ул. Пушкина 10',
            ])
            ->assertStatus(201)
            ->assertJsonPath('address', 'ул. Пушкина 10');
    }

    public function test_cannot_add_address_to_foreign_client(): void
    {
        $foreign = CalcClient::create([
            'telegram_id' => '999999999',
            'name'        => 'Чужой',
        ]);

        $this->withCalcSession()
            ->postJson("/api/calc/clients/{$foreign->id}/addresses", [
                'address' => 'Попытка',
            ])
            ->assertStatus(404);
    }

    // ──── POST /api/calc/drawings ────

    public function test_save_drawing(): void
    {
        $client = CalcClient::create(['telegram_id' => '123456789', 'name' => 'Заказчик']);
        $addr   = CalcClientAddress::create(['client_id' => $client->id, 'address' => 'ул. Тестовая 1']);
        $room   = CalcRoom::first();

        $drawingData = [
            'room_parameters' => [
                'room_area'        => 15.5,
                'perimeter'        => 16.0,
                'perimeter_shrink' => 14.88,
                'angles_count'     => 4,
            ],
            'material_and_canvas' => [
                'sq_polotna'    => 18.2,
                'angle_final'   => 0,
                'material_data' => [
                    'material_name' => 'Мат-белый',
                    'price'         => 110,
                    'price_montage' => 100,
                ],
            ],
            'seams_data'  => ['seam_flag' => 0, 'seam_count' => 0],
            'lighting'    => ['lighting_count' => 2],
            'goods_and_jobs' => ['goods' => [], 'jobs' => []],
        ];

        $response = $this->withCalcSession()
            ->postJson('/api/calc/drawings', [
                'client_id'    => $client->id,
                'address_id'   => $addr->id,
                'room_id'      => $room->id,
                'drawing_data' => $drawingData,
                'cut_img_svg'  => '<svg>test</svg>',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'saved')
            ->assertJsonPath('area', 15.5)
            ->assertJsonPath('corners_count', 4)
            ->assertJsonPath('material_name', 'Мат-белый')
            ->assertJsonPath('lighting_count', 2);

        $this->assertDatabaseHas('calc_drawings', [
            'client_id'     => $client->id,
            'area'          => '15.5000',
            'material_name' => 'Мат-белый',
        ]);
    }

    public function test_cannot_save_drawing_for_foreign_client(): void
    {
        $foreign = CalcClient::create(['telegram_id' => '999999999', 'name' => 'Чужой']);

        $this->withCalcSession()
            ->postJson('/api/calc/drawings', [
                'client_id'    => $foreign->id,
                'drawing_data' => [],
            ])
            ->assertStatus(404);
    }

    // ──── GET /api/calc/drawings ────

    public function test_get_drawings_list(): void
    {
        $client  = CalcClient::create(['telegram_id' => '123456789', 'name' => 'Клиент']);
        CalcDrawing::create(['client_id' => $client->id, 'area' => 10.0, 'perimeter' => 12.0]);
        CalcDrawing::create(['client_id' => $client->id, 'area' => 20.0, 'perimeter' => 18.0]);

        $this->withCalcSession()
            ->getJson('/api/calc/drawings')
            ->assertStatus(200)
            ->assertJsonCount(2);
    }

    // ──── DELETE /api/calc/drawings/{id} ────

    public function test_soft_delete_drawing(): void
    {
        $client  = CalcClient::create(['telegram_id' => '123456789', 'name' => 'Клиент']);
        $drawing = CalcDrawing::create(['client_id' => $client->id, 'area' => 5.0, 'perimeter' => 8.0]);

        $this->withCalcSession()
            ->deleteJson("/api/calc/drawings/{$drawing->id}")
            ->assertStatus(204);

        $this->assertSoftDeleted('calc_drawings', ['id' => $drawing->id]);
    }
}
