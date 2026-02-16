<?php

namespace App\Services;

use App\Models\CmsMedia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ContentBlockDataValidator
{
    public const ALLOWED_TYPES = [
        'hero',
        'simple_text',
        'gallery',
        'pr_table',
        'form_low_price',
        'zamer',
    ];

    /**
     * Validate block type and data. Throws ValidationException on failure.
     */
    public function validate(string $type, ?array $data): array
    {
        if (!in_array($type, self::ALLOWED_TYPES, true)) {
            throw ValidationException::withMessages([
                'type' => ['Тип блока не разрешён. Разрешены: ' . implode(', ', self::ALLOWED_TYPES)],
            ]);
        }

        $data = $data ?? [];
        $rules = $this->rulesForType($type);
        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    protected function rulesForType(string $type): array
    {
        return match ($type) {
            'hero' => [
                'title' => 'required|string|max:500',
                'subtitle' => 'nullable|string|max:1000',
                'cta_text' => 'nullable|string|max:255',
                'cta_url' => 'nullable|string|max:500',
            ],
            'simple_text' => [
                'html' => 'nullable|string|required_without:text',
                'text' => 'nullable|string|required_without:html',
            ],
            'gallery' => [
                'media_ids' => 'required|array',
                'media_ids.*' => 'required|integer|exists:cms_media,id',
            ],
            'pr_table' => [
                'rows' => 'required|array',
                'rows.*' => 'array',
            ],
            'form_low_price' => [
                'enabled' => 'required|boolean',
            ],
            'zamer' => [
                'enabled' => 'required|boolean',
            ],
            default => [],
        };
    }

}
