<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFolderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $folderId = $this->route('folder') ?? $this->route('id');
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('folders', 'name')->ignore($folderId)],
            'slug' => ['nullable'],
            'parent_id' => ['nullable', 'integer'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => $this->slug ?: str(strtolower($this->name))->slug(),
        ]);
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'Папка с таким наименованием существует',
            'name.required' => 'Заполните наименование папки',
        ];
    }
}
