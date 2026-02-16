<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $maxSize = config('media.upload.max_size', 10240);
        $allowAllTypes = config('media.upload.allow_all_types', false);
        $rules = [
            'file' => ['required', 'file', "max:{$maxSize}"],
            'folder_id' => 'nullable|exists:folders,id',
        ];
        if (!$allowAllTypes) {
            $allowedMimes = config('media.upload.allowed_mime_types', []);
            if (!empty($allowedMimes)) {
                $rules['file'][] = 'mimes:jpeg,jpg,png,gif,webp,svg,pdf,doc,docx,mp4';
            }
        }
        return $rules;
    }

    public function messages(): array
    {
        $maxSizeMB = round(config('media.upload.max_size', 10240) / 1024, 1);
        return [
            'file.required' => 'Файл обязателен для загрузки',
            'file.file' => 'Загружаемый объект должен быть файлом',
            'file.max' => "Размер файла не должен превышать {$maxSizeMB} МБ",
            'file.mimes' => 'Тип файла не разрешен для загрузки',
            'folder_id.exists' => 'Указанная папка не существует',
        ];
    }
}
