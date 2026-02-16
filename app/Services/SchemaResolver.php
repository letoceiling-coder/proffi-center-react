<?php

namespace App\Services;

use App\Models\Page;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\SchemaBlock;
use App\Models\Service;
use App\Models\Site;

final class SchemaResolver
{
    /**
     * Возвращает массив JSON-LD объектов для отдачи на фронт.
     * 1) site-level: enabled schema_blocks где schemaable_type=Site, schemaable_id=site (текущий), затем fallback root site (без дублей по type).
     * 2) entity-level: если entity задана — enabled schema_blocks для этой сущности.
     *
     * @param Page|Service|ProductCategory|Product|null $entity
     * @return array<int, array<string, mixed>>
     */
    public function resolveFor(Site $site, ?object $entity = null): array
    {
        $result = [];
        $siteTypes = [];

        $siteLevel = SchemaBlock::where('schemaable_type', Site::class)
            ->where('schemaable_id', $site->id)
            ->where('is_enabled', true)
            ->orderBy('order')
            ->orderBy('id')
            ->get();

        foreach ($siteLevel as $block) {
            $result[] = $this->blockToJsonLd($block);
            $siteTypes[$block->type] = true;
        }

        $rootSite = (new SiteResolverService())->getRootSite();
        if ($rootSite && $rootSite->id !== $site->id) {
            $rootLevel = SchemaBlock::where('schemaable_type', Site::class)
                ->where('schemaable_id', $rootSite->id)
                ->where('is_enabled', true)
                ->orderBy('order')
                ->orderBy('id')
                ->get();
            foreach ($rootLevel as $block) {
                if (empty($siteTypes[$block->type])) {
                    $result[] = $this->blockToJsonLd($block);
                }
            }
        }

        if ($entity !== null) {
            $entityType = get_class($entity);
            $entityId = $entity->getKey();
            $entityBlocks = SchemaBlock::where('schemaable_type', $entityType)
                ->where('schemaable_id', $entityId)
                ->where('is_enabled', true)
                ->orderBy('order')
                ->orderBy('id')
                ->get();
            foreach ($entityBlocks as $block) {
                $result[] = $this->blockToJsonLd($block);
            }
        }

        return $result;
    }

    private function blockToJsonLd(SchemaBlock $block): array
    {
        $data = $block->data ?? [];
        if (!is_array($data)) {
            return ['@type' => $block->type, '@context' => 'https://schema.org'];
        }
        if (!isset($data['@context'])) {
            $data['@context'] = 'https://schema.org';
        }
        return $data;
    }
}
