<?php

namespace App\Http\Controllers\Api\Calc;

use App\Http\Controllers\Controller;
use App\Models\CalcClient;
use App\Models\CalcClientAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalcClientController extends Controller
{
    private function telegramId(Request $request): string
    {
        return (string) $request->attributes->get('calc_telegram_user')['id'];
    }

    /**
     * Список клиентов текущего оператора.
     */
    public function index(Request $request): JsonResponse
    {
        $tgId = $this->telegramId($request);

        $search = $request->query('search');

        $clients = CalcClient::query()
            ->where('telegram_id', $tgId)
            ->when($search, fn ($q) => $q->where(function ($q2) use ($search) {
                $q2->where('name', 'like', "%{$search}%")
                   ->orWhere('phone', 'like', "%{$search}%");
            }))
            ->withCount(['addresses', 'drawings'])
            ->with('addresses')
            ->orderByDesc('updated_at')
            ->get();

        return response()->json($clients);
    }

    /**
     * Создать клиента (+ первый адрес, если передан).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'    => 'required|string|max:255',
            'phone'   => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
        ]);

        $client = CalcClient::create([
            'telegram_id' => $this->telegramId($request),
            'name'        => $data['name'],
            'phone'       => $data['phone'] ?? null,
        ]);

        $address = null;
        if (! empty($data['address'])) {
            $address = CalcClientAddress::create([
                'client_id' => $client->id,
                'address'   => $data['address'],
            ]);
        }

        return response()->json([
            'client'  => $client->load('addresses'),
            'address' => $address,
        ], 201);
    }

    /**
     * Данные клиента с адресами и количеством чертежей.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $client = CalcClient::query()
            ->where('telegram_id', $this->telegramId($request))
            ->with('addresses')
            ->withCount('drawings')
            ->findOrFail($id);

        return response()->json($client);
    }

    /**
     * Обновить клиента.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $client = CalcClient::query()
            ->where('telegram_id', $this->telegramId($request))
            ->findOrFail($id);

        $data = $request->validate([
            'name'  => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:50',
        ]);

        $client->update($data);

        return response()->json($client->load('addresses'));
    }

    /**
     * Удалить клиента (SoftDelete).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $client = CalcClient::query()
            ->where('telegram_id', $this->telegramId($request))
            ->findOrFail($id);

        $client->delete();

        return response()->json(null, 204);
    }

    // ---- Адреса ----

    /**
     * Список адресов клиента.
     */
    public function addresses(Request $request, int $id): JsonResponse
    {
        $client = CalcClient::query()
            ->where('telegram_id', $this->telegramId($request))
            ->findOrFail($id);

        return response()->json($client->addresses()->withCount('drawings')->get());
    }

    /**
     * Добавить адрес клиенту.
     */
    public function addAddress(Request $request, int $id): JsonResponse
    {
        $client = CalcClient::query()
            ->where('telegram_id', $this->telegramId($request))
            ->findOrFail($id);

        $data = $request->validate(['address' => 'required|string|max:500']);

        $address = CalcClientAddress::create([
            'client_id' => $client->id,
            'address'   => $data['address'],
        ]);

        return response()->json($address, 201);
    }
}
