<?php

namespace App\Services;

use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Service;
use App\Models\Site;

/**
 * Строит дерево пунктов меню с href (path без домена) для публичного API.
 */
final class PublicMenuBuilder
{
    public function buildTree(Site $site, string $menuSlug): array
    {
        $menu = $site->menus()->where('slug', $menuSlug)->first();
        if (!$menu) {
            $rootSite = (new SiteResolverService())->getRootSite();
            if ($rootSite && $rootSite->id !== $site->id) {
                $menu = $rootSite->menus()->where('slug', $menuSlug)->first();
            }
        }
        if (!$menu) {
            return [];
        }
        $items = MenuItem::where('menu_id', $menu->id)->orderBy('order')->orderBy('id')->get();
        return $this->buildTreeRecursive($items->toArray(), null, $site->id);
    }

    /**
     * @param array<int, array<string, mixed>> $flat
     * @return array<int, array{title: string, href: string, open_new_tab: bool, order: int, children: array}>
     */
    private function buildTreeRecursive(array $flat, ?int $parentId, int $siteId): array
    {
        $result = [];
        foreach ($flat as $item) {
            $pid = isset($item['parent_id']) ? (int) $item['parent_id'] : null;
            if ($pid !== $parentId) {
                continue;
            }
            $result[] = [
                'title' => $item['title'] ?? '',
                'href' => $this->hrefForItem($item, $siteId),
                'open_new_tab' => !empty($item['open_new_tab']),
                'order' => (int) ($item['order'] ?? 0),
                'children' => $this->buildTreeRecursive($flat, (int) $item['id'], $siteId),
            ];
        }
        usort($result, fn ($a, $b) => $a['order'] <=> $b['order']);
        return $result;
    }

    private function hrefForItem(array $item, int $siteId): string
    {
        $linkType = $item['link_type'] ?? 'url';
        $linkValue = $item['link_value'] ?? '/';
        if ($linkType === 'url') {
            return $linkValue ?: '/';
        }
        if ($linkType === 'page') {
            return '/' . ltrim($linkValue, '/');
        }
        if ($linkType === 'service') {
            return '/uslugi/' . ltrim($linkValue, '/');
        }
        if ($linkType === 'category') {
            return '/catalog/' . ltrim($linkValue, '/');
        }
        if ($linkType === 'product') {
            $product = Product::where('site_id', $siteId)->where('slug', $linkValue)->first();
            if ($product && $product->productCategory) {
                return '/catalog/' . $product->productCategory->slug . '/' . ltrim($linkValue, '/');
            }
            return '/catalog/category/' . ltrim($linkValue, '/');
        }
        return '/';
    }
}
