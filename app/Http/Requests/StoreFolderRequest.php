<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFolderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'unique:folders,name', 'string', 'max:255'],
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
