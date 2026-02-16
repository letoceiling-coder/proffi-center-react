<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MenuItemController extends Controller
{
    private const LINK_TYPES = ['url', 'page', 'service', 'category', 'product'];

    /**
     * GET /menus/{menu}/items — дерево (root items с вложенными children по order).
     */
    public function index(Menu $menu): JsonResponse
    {
        $menu->load('site:id,domain');
        $items = MenuItem::where('menu_id', $menu->id)
            ->orderBy('order')
            ->get();
        $tree = $this->buildTree($items->toArray(), null);
        return response()->json([
            'data' => [
                'menu' => $menu,
                'items' => $tree,
            ],
        ]);
    }

    /**
     * POST /menus/{menu}/items
     */
    public function store(Request $request, Menu $menu): JsonResponse
    {
        $validated = $this->validateItem($request, $menu, null);
        $validated['menu_id'] = $menu->id;
        if (empty($validated['parent_id'])) {
            $validated['parent_id'] = null;
        }
        $validated['order'] = (int) ($validated['order'] ?? 0);
        if ($validated['order'] < 0) {
            $validated['order'] = 0;
        }
        $item = MenuItem::create($validated);
        $item->load('parent');
        return response()->json(['data' => $item], 201);
    }

    /**
     * PUT /menu-items/{id}
     */
    public function update(Request $request, MenuItem $menu_item): JsonResponse
    {
        $menu = $menu_item->menu;
        $validated = $this->validateItem($request, $menu, $menu_item);
        if (array_key_exists('parent_id', $validated) && $validated['parent_id'] == '') {
            $validated['parent_id'] = null;
        }
        if (array_key_exists('order', $validated)) {
            $validated['order'] = max(0, (int) $validated['order']);
        }
        $menu_item->update($validated);
        $menu_item->load('parent');
        return response()->json(['data' => $menu_item->fresh()]);
    }

    /**
     * DELETE /menu-items/{id} — каскадное удаление потомков в приложении.
     */
    public function destroy(MenuItem $menu_item): JsonResponse
    {
        $this->deleteItemRecursive($menu_item);
        return response()->json(['message' => 'Пункт меню удалён']);
    }

    /**
     * POST /menu-items/{id}/move — direction: up|down или order: int
     */
    public function move(Request $request, MenuItem $menu_item): JsonResponse
    {
        $request->validate([
            'direction' => 'nullable|in:up,down',
            'order' => 'nullable|integer|min:0',
        ]);
        $siblings = MenuItem::where('menu_id', $menu_item->menu_id)
            ->where('parent_id', $menu_item->parent_id)
            ->orderBy('order')
            ->orderBy('id')
            ->get();
        $index = $siblings->search(fn ($s) => (int) $s->id === (int) $menu_item->id);
        if ($index === false) {
            return response()->json(['message' => 'Item not in list'], 400);
        }
        if ($request->filled('order')) {
            $newOrder = (int) $request->get('order');
            $menu_item->update(['order' => $newOrder]);
            $this->reorderSiblings($menu_item->menu_id, $menu_item->parent_id);
        } elseif ($request->get('direction') === 'up' && $index > 0) {
            $prev = $siblings[$index - 1];
            $this->swapOrder($menu_item, $prev);
        } elseif ($request->get('direction') === 'down' && $index < $siblings->count() - 1) {
            $next = $siblings[$index + 1];
            $this->swapOrder($menu_item, $next);
        }
        $menu_item->load('parent');
        return response()->json(['data' => $menu_item->fresh()]);
    }

    private function validateItem(Request $request, Menu $menu, ?MenuItem $except): array
    {
        $siteId = $menu->site_id;
        $rules = [
            'parent_id' => [
                'nullable',
                Rule::exists('menu_items', 'id')->where('menu_id', $menu->id),
            ],
            'title' => 'required|string|max:255',
            'link_type' => ['required', Rule::in(self::LINK_TYPES)],
            'link_value' => 'required|string|max:500',
            'open_new_tab' => 'nullable|boolean',
            'order' => 'nullable|integer|min:0',
        ];

        $validated = $request->validate($rules);

        $linkType = $validated['link_type'];
        $linkValue = $validated['link_value'];

        $linkValueError = null;
        if ($linkType === 'url') {
            // url или path — без проверки существования сущности
        } elseif ($linkType === 'page') {
            if (! Page::where('site_id', $siteId)->where('slug', $linkValue)->exists()) {
                $linkValueError = 'Страница с таким slug не найдена или принадлежит другому сайту.';
            }
        } elseif ($linkType === 'service') {
            if (! Service::where('site_id', $siteId)->where('slug', $linkValue)->exists()) {
                $linkValueError = 'Услуга с таким slug не найдена или принадлежит другому сайту.';
            }
        } elseif ($linkType === 'category') {
            if (! ProductCategory::where('site_id', $siteId)->where('slug', $linkValue)->exists()) {
                $linkValueError = 'Категория с таким slug не найдена или принадлежит другому сайту.';
            }
        } elseif ($linkType === 'product') {
            if (! Product::where('site_id', $siteId)->where('slug', $linkValue)->exists()) {
                $linkValueError = 'Товар с таким slug не найден или принадлежит другому сайту.';
            }
        }

        if ($linkValueError !== null) {
            throw \Illuminate\Validation\ValidationException::withMessages(['link_value' => [$linkValueError]]);
        }

        $validated['open_new_tab'] = (bool) ($validated['open_new_tab'] ?? false);
        return $validated;
    }

    private function buildTree(array $items, ?int $parentId): array
    {
        $result = [];
        foreach ($items as $item) {
            $pid = isset($item['parent_id']) ? (int) $item['parent_id'] : null;
            if ($pid === $parentId) {
                $child = $item;
                $child['children'] = $this->buildTree($items, (int) $item['id']);
                $result[] = $child;
            }
        }
        usort($result, fn ($a, $b) => ($a['order'] ?? 0) <=> ($b['order'] ?? 0));
        return $result;
    }

    private function deleteItemRecursive(MenuItem $item): void
    {
        foreach ($item->children as $child) {
            $this->deleteItemRecursive($child);
        }
        $item->delete();
    }

    private function swapOrder(MenuItem $a, MenuItem $b): void
    {
        $orderA = $a->order;
        $orderB = $b->order;
        $a->update(['order' => $orderB]);
        $b->update(['order' => $orderA]);
    }

    private function reorderSiblings(int $menuId, ?int $parentId): void
    {
        $siblings = MenuItem::where('menu_id', $menuId)
            ->where('parent_id', $parentId)
            ->orderBy('order')
            ->orderBy('id')
            ->get();
        foreach ($siblings as $i => $s) {
            if ((int) $s->order !== $i) {
                $s->update(['order' => $i]);
            }
        }
    }
}
