<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\SchemaBlock;
use App\Models\Service;
use App\Models\Site;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SchemaBlockController extends Controller
{
    private const TYPES = ['Organization', 'LocalBusiness', 'Service', 'BreadcrumbList', 'FAQPage'];

    private const SCHEMAABLE_MAP = [
        'site' => Site::class,
        'page' => Page::class,
        'service' => Service::class,
    ];

    public function index(Request $request): JsonResponse
    {
        $query = SchemaBlock::query()->with('schemaable');
        if ($request->filled('site_id')) {
            $siteId = (int) $request->get('site_id');
            $query->where(function ($q) use ($siteId) {
                $q->where('schemaable_type', Site::class)->where('schemaable_id', $siteId)
                    ->orWhere(function ($q2) use ($siteId) {
                        $q2->where('schemaable_type', Page::class)
                            ->whereIn('schemaable_id', Page::where('site_id', $siteId)->pluck('id'));
                    })
                    ->orWhere(function ($q2) use ($siteId) {
                        $q2->where('schemaable_type', Service::class)
                            ->whereIn('schemaable_id', Service::where('site_id', $siteId)->pluck('id'));
                    });
            });
        }
        if ($request->filled('type')) {
            $query->where('type', $request->get('type'));
        }
        if ($request->filled('q')) {
            $q = $request->get('q');
            $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '$')) LIKE ?", ["%{$q}%"]);
        }
        $query->orderBy('order')->orderBy('id');
        $perPage = min(max((int) $request->get('per_page', 15), 1), 100);
        $data = $query->paginate($perPage);
        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateSchemaBlock($request);
        DB::transaction(function () use ($validated, &$block) {
            $block = SchemaBlock::create($validated);
            $this->enforceSingleEnabledPerScope($block);
        });
        $block = SchemaBlock::find($block->id);
        $block->load('schemaable');
        return response()->json(['data' => $block], 201);
    }

    public function show(SchemaBlock $schema_block): JsonResponse
    {
        $schema_block->load('schemaable');
        return response()->json(['data' => $schema_block]);
    }

    public function update(Request $request, SchemaBlock $schema_block): JsonResponse
    {
        $this->normalizeData($request);
        $validated = $this->validateSchemaBlock($request, $schema_block);
        DB::transaction(function () use ($schema_block, $validated) {
            $schema_block->update($validated);
            $this->enforceSingleEnabledPerScope($schema_block);
        });
        $schema_block->load('schemaable');
        return response()->json(['data' => $schema_block->fresh()]);
    }

    public function destroy(SchemaBlock $schema_block): JsonResponse
    {
        $schema_block->delete();
        return response()->json(['message' => 'Блок удалён']);
    }

    private function normalizeData(Request $request): void
    {
        if (is_string($request->input('data'))) {
            $decoded = json_decode($request->input('data'), true);
            $request->merge(['data' => is_array($decoded) ? $decoded : []]);
        }
    }

    private function validateSchemaBlock(Request $request, ?SchemaBlock $except = null): array
    {
        $validated = $request->validate([
            'schemaable_type' => ['required', 'string', Rule::in(array_values(self::SCHEMAABLE_MAP))],
            'schemaable_id' => 'required|integer|min:1',
            'type' => ['required', 'string', Rule::in(self::TYPES)],
            'data' => 'required|array',
            'is_enabled' => 'nullable|boolean',
            'order' => 'nullable|integer|min:0',
        ]);
        $validated['is_enabled'] = (bool) ($validated['is_enabled'] ?? true);
        $validated['order'] = (int) ($validated['order'] ?? 0);
        $this->validateSchemaableExists($validated['schemaable_type'], $validated['schemaable_id']);
        $this->validateDataByType($validated['type'], $validated['data']);
        return $validated;
    }

    private function validateSchemaableExists(string $type, int $id): void
    {
        $exists = match ($type) {
            Site::class => Site::where('id', $id)->exists(),
            Page::class => Page::where('id', $id)->exists(),
            Service::class => Service::where('id', $id)->exists(),
            default => false,
        };
        if (!$exists) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'schemaable_id' => ['Указанная сущность не найдена.'],
            ]);
        }
    }

    private function validateDataByType(string $type, array $data): void
    {
        $required = match ($type) {
            'Organization' => ['@type', 'name'],
            'LocalBusiness' => ['@type', 'name'],
            'Service' => ['@type'],
            'BreadcrumbList' => ['@type', 'itemListElement'],
            'FAQPage' => ['@type', 'mainEntity'],
            default => [],
        };
        foreach ($required as $key) {
            if (!array_key_exists($key, $data)) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'data' => ["Для типа {$type} в data обязателен ключ: {$key}."],
                ]);
            }
        }
    }

    private function enforceSingleEnabledPerScope(SchemaBlock $block): void
    {
        if (!$block->is_enabled) {
            return;
        }
        SchemaBlock::where('id', '!=', $block->id)
            ->where('schemaable_type', $block->schemaable_type)
            ->where('schemaable_id', $block->schemaable_id)
            ->where('type', $block->type)
            ->update(['is_enabled' => false]);
    }
}
