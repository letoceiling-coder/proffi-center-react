<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\ContentBlock;
use App\Models\Page;
use App\Models\Product;
use App\Models\Service;
use App\Services\ContentBlockDataValidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentBlockController extends Controller
{
    public function __construct(
        protected ContentBlockDataValidator $blockValidator
    ) {}

    public function indexForPage(Page $page): JsonResponse
    {
        $blocks = $page->blocks()->orderBy('order')->get();
        return response()->json(['data' => $blocks]);
    }

    public function indexForService(Service $service): JsonResponse
    {
        $blocks = $service->blocks()->orderBy('order')->get();
        return response()->json(['data' => $blocks]);
    }

    public function indexForProduct(Product $product): JsonResponse
    {
        $blocks = $product->blocks()->orderBy('order')->get();
        return response()->json(['data' => $blocks]);
    }

    public function storeForPage(Request $request, Page $page): JsonResponse
    {
        return $this->storeBlock($request, $page);
    }

    public function storeForService(Request $request, Service $service): JsonResponse
    {
        return $this->storeBlock($request, $service);
    }

    public function storeForProduct(Request $request, Product $product): JsonResponse
    {
        return $this->storeBlock($request, $product);
    }

    protected function storeBlock(Request $request, Page|Service|Product $blockable): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string|max:100',
            'data' => 'nullable|array',
            'order' => 'nullable|integer|min:0',
        ]);
        $type = $validated['type'];
        $data = $validated['data'] ?? [];
        $this->blockValidator->validate($type, $data);

        $maxOrder = (int) $blockable->blocks()->max('order');
        $order = isset($validated['order']) ? (int) $validated['order'] : ($maxOrder + 1);

        $block = $blockable->blocks()->create([
            'type' => $type,
            'data' => $data,
            'order' => $order,
        ]);
        return response()->json(['data' => $block], 201);
    }

    public function update(Request $request, ContentBlock $block): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'sometimes|string|max:100',
            'data' => 'nullable|array',
            'order' => 'sometimes|integer|min:0',
        ]);
        $type = $validated['type'] ?? $block->type;
        $data = array_key_exists('data', $validated) ? $validated['data'] : ($block->data ?? []);
        if (array_key_exists('type', $validated) || array_key_exists('data', $validated)) {
            $this->blockValidator->validate($type, $data);
        }
        if (array_key_exists('data', $validated)) {
            $block->data = $validated['data'];
        }
        if (array_key_exists('type', $validated)) {
            $block->type = $validated['type'];
        }
        if (array_key_exists('order', $validated)) {
            $block->order = (int) $validated['order'];
        }
        $block->save();
        return response()->json(['data' => $block->fresh()]);
    }

    public function destroy(ContentBlock $block): JsonResponse
    {
        $block->delete();
        return response()->json(['message' => 'Блок удалён']);
    }

    /** Изменить порядок: body { "order": 0 } (новый индекс) или { "direction": "up"|"down" }. */
    public function move(Request $request, ContentBlock $block): JsonResponse
    {
        $blockable = $block->blockable;
        $blocks = $blockable->blocks()->orderBy('order')->get()->values();
        $idx = $blocks->search(fn ($b) => (int) $b->id === (int) $block->id);
        if ($idx === false) {
            return response()->json(['message' => 'Блок не найден'], 422);
        }

        $newIdx = $idx;
        if ($request->has('order')) {
            $newIdx = (int) $request->validate(['order' => 'required|integer|min:0'])['order'];
            $newIdx = min(max(0, $newIdx), $blocks->count() - 1);
        } elseif ($request->has('direction')) {
            $dir = $request->validate(['direction' => 'required|in:up,down'])['direction'];
            if ($dir === 'up' && $idx > 0) {
                $newIdx = $idx - 1;
            } elseif ($dir === 'down' && $idx < $blocks->count() - 1) {
                $newIdx = $idx + 1;
            }
        } else {
            return response()->json(['message' => 'Укажите order или direction'], 422);
        }

        if ($newIdx === $idx) {
            return response()->json(['data' => $block->fresh(), 'message' => 'Порядок не изменился']);
        }

        $list = $blocks->all();
        $item = $list[$idx];
        array_splice($list, $idx, 1);
        array_splice($list, $newIdx, 0, [$item]);
        foreach ($list as $i => $b) {
            $b->update(['order' => $i]);
        }
        return response()->json(['data' => $block->fresh(), 'message' => 'Порядок обновлён']);
    }
}
