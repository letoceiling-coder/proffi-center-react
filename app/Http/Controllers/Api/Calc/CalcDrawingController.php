<?php

namespace App\Http\Controllers\Api\Calc;

use App\Http\Controllers\Controller;
use App\Models\CalcClient;
use App\Models\CalcDrawing;
use App\Models\CalcDrawingImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CalcDrawingController extends Controller
{
    private function telegramId(Request $request): string
    {
        return (string) $request->attributes->get('calc_telegram_user')['id'];
    }

    /** Проверка, что чертёж принадлежит текущему оператору. */
    private function ownDrawing(Request $request, int $drawingId): CalcDrawing
    {
        $tgId = $this->telegramId($request);

        return CalcDrawing::query()
            ->whereHas('client', fn ($q) => $q->where('telegram_id', $tgId))
            ->with(['client', 'address', 'room', 'images'])
            ->findOrFail($drawingId);
    }

    /**
     * Все чертежи оператора.
     */
    public function index(Request $request): JsonResponse
    {
        $tgId = $this->telegramId($request);

        $drawings = CalcDrawing::query()
            ->whereHas('client', fn ($q) => $q->where('telegram_id', $tgId))
            ->with(['client:id,name,phone', 'address:id,address', 'room:id,name', 'images'])
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn ($d) => $this->formatDrawing($d));

        return response()->json($drawings);
    }

    /**
     * Чертежи конкретного клиента.
     */
    public function byClient(Request $request, int $clientId): JsonResponse
    {
        $tgId = $this->telegramId($request);

        $client = CalcClient::query()
            ->where('telegram_id', $tgId)
            ->findOrFail($clientId);

        $drawings = CalcDrawing::query()
            ->where('client_id', $client->id)
            ->with(['address:id,address', 'room:id,name', 'images'])
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn ($d) => $this->formatDrawing($d));

        return response()->json($drawings);
    }

    /**
     * Сохранить чертёж.
     * Принимает: client_id, address_id?, room_id?, room_note?, title?,
     *            drawing_data, raw_drawing_data?, raw_cuts_json?,
     *            cut_img_svg?, calc_img_svg?,
     *            goods_data?, works_data?
     */
    public function store(Request $request): JsonResponse
    {
        $tgId = $this->telegramId($request);

        $data = $request->validate([
            'client_id'       => 'required|integer',
            'address_id'      => 'nullable|integer',
            'room_id'         => 'nullable|integer',
            'room_note'       => 'nullable|string|max:255',
            'title'           => 'nullable|string|max:255',
            'drawing_data'    => 'nullable|array',
            'raw_drawing_data'=> 'nullable|array',
            'raw_cuts_json'   => 'nullable|array',
            'cut_img_svg'     => 'nullable|string',
            'calc_img_svg'    => 'nullable|string',
            'goods_data'      => 'nullable|array',
            'works_data'      => 'nullable|array',
        ]);

        // Проверяем владение клиентом
        CalcClient::query()
            ->where('telegram_id', $tgId)
            ->where('id', $data['client_id'])
            ->firstOrFail();

        $drawing = new CalcDrawing($data);
        $drawing->status = 'saved';

        if (! empty($data['drawing_data'])) {
            $drawing->fillFromDrawingData($data['drawing_data']);
        }

        $drawing->save();

        return response()->json($this->formatDrawing($drawing->load(['client', 'address', 'room', 'images'])), 201);
    }

    /**
     * Получить чертёж.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $drawing = $this->ownDrawing($request, $id);

        return response()->json($this->formatDrawing($drawing));
    }

    /**
     * Обновить чертёж.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $drawing = $this->ownDrawing($request, $id);

        $data = $request->validate([
            'address_id'      => 'nullable|integer',
            'room_id'         => 'nullable|integer',
            'room_note'       => 'nullable|string|max:255',
            'title'           => 'nullable|string|max:255',
            'status'          => 'nullable|in:draft,saved,estimated',
            'drawing_data'    => 'nullable|array',
            'raw_drawing_data'=> 'nullable|array',
            'raw_cuts_json'   => 'nullable|array',
            'cut_img_svg'     => 'nullable|string',
            'calc_img_svg'    => 'nullable|string',
            'goods_data'      => 'nullable|array',
            'works_data'      => 'nullable|array',
        ]);

        if (! empty($data['drawing_data'])) {
            $drawing->fillFromDrawingData($data['drawing_data']);
        }

        $drawing->fill($data)->save();

        return response()->json($this->formatDrawing($drawing->load(['client', 'address', 'room', 'images'])));
    }

    /**
     * Удалить чертёж (SoftDelete).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $drawing = $this->ownDrawing($request, $id);
        $drawing->delete();

        return response()->json(null, 204);
    }

    /**
     * Загрузить PNG изображение чертежа (base64 или файл).
     * POST /api/calc/drawings/{id}/images
     * Body: type=png|png_alt, image_base64=data:image/png;base64,...
     *   или multipart: type=png|png_alt, image=<file>
     */
    public function uploadImage(Request $request, int $id): JsonResponse
    {
        $drawing = $this->ownDrawing($request, $id);

        $request->validate([
            'type'          => 'required|in:png,png_alt',
            'image_base64'  => 'nullable|string',
            'image'         => 'nullable|file|mimes:png,jpg,jpeg|max:10240',
        ]);

        $type = $request->input('type');
        $dir  = "calc/drawings/{$drawing->id}";

        // Удалить старое изображение этого типа
        $existing = $drawing->images()->where('type', $type)->first();
        if ($existing) {
            Storage::disk($existing->disk)->delete($existing->path);
            $existing->delete();
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store($dir, 'public');
        } elseif ($request->filled('image_base64')) {
            $path = $this->storeBase64($request->input('image_base64'), $dir, $type);
        } else {
            return response()->json(['error' => 'No image provided'], 422);
        }

        $image = CalcDrawingImage::create([
            'drawing_id' => $drawing->id,
            'type'       => $type,
            'path'       => $path,
            'disk'       => 'public',
        ]);

        return response()->json($image, 201);
    }

    /** Сохранить base64 PNG в storage, вернуть path. */
    private function storeBase64(string $base64, string $dir, string $type): string
    {
        // Убираем data:image/png;base64, префикс
        $data = preg_replace('/^data:image\/\w+;base64,/', '', $base64);
        $binary = base64_decode($data);

        $filename = "{$type}_" . time() . '.png';
        $path = "{$dir}/{$filename}";

        Storage::disk('public')->put($path, $binary);

        return $path;
    }

    /** Форматирование ответа (без SVG в списке — они большие). */
    private function formatDrawing(CalcDrawing $d, bool $withSvg = false): array
    {
        $result = [
            'id'              => $d->id,
            'client_id'       => $d->client_id,
            'address_id'      => $d->address_id,
            'room_id'         => $d->room_id,
            'room_note'       => $d->room_note,
            'title'           => $d->title,
            'status'          => $d->status,
            'area'            => $d->area,
            'perimeter'       => $d->perimeter,
            'corners_count'   => $d->corners_count,
            'canvas_area'     => $d->canvas_area,
            'material_name'   => $d->material_name,
            'material_price'  => $d->material_price,
            'mount_price'     => $d->mount_price,
            'has_seams'       => $d->has_seams,
            'seams_count'     => $d->seams_count,
            'lighting_count'  => $d->lighting_count,
            'client'          => $d->relationLoaded('client')  ? $d->client  : null,
            'address'         => $d->relationLoaded('address') ? $d->address : null,
            'room'            => $d->relationLoaded('room')    ? $d->room    : null,
            'images'          => $d->relationLoaded('images')  ? $d->images  : [],
            'created_at'      => $d->created_at,
            'updated_at'      => $d->updated_at,
        ];

        if ($withSvg) {
            $result['cut_img_svg']  = $d->cut_img_svg;
            $result['calc_img_svg'] = $d->calc_img_svg;
            $result['drawing_data'] = $d->drawing_data;
            $result['raw_drawing_data'] = $d->raw_drawing_data;
        }

        return $result;
    }
}
