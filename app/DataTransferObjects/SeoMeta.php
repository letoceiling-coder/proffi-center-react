<?php

namespace App\DataTransferObjects;

/**
 * Единый DTO для серверной SEO-разметки (head + опционально тело для ботов).
 * Все meta вставляются в <head> на сервере (Blade), до загрузки React.
 */
final class SeoMeta
{
    public function __construct(
        public string $title,
        public ?string $description,
        public string $canonical,
        public string $robots = 'index,follow',
        public ?string $ogTitle = null,
        public ?string $ogDescription = null,
        public ?string $ogImage = null,
        public ?string $ogUrl = null,
        public ?string $h1 = null,
        /** @var array<int, array<string, mixed>> JSON-LD объекты для script type="application/ld+json" */
        public array $jsonLd = [],
    ) {
        $this->ogTitle = $ogTitle ?? $title;
        $this->ogDescription = $ogDescription ?? $description;
        $this->ogUrl = $ogUrl ?? $canonical;
    }

    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'description' => $this->description,
            'canonical' => $this->canonical,
            'robots' => $this->robots,
            'og_title' => $this->ogTitle,
            'og_description' => $this->ogDescription,
            'og_image' => $this->ogImage,
            'og_url' => $this->ogUrl,
            'h1' => $this->h1,
            'json_ld' => $this->jsonLd,
        ];
    }
}
