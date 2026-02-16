<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = Role::with('users')->get();
        return response()->json(['data' => $roles]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:roles,slug',
            'description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Ошибка валидации', 'errors' => $validator->errors()], 422);
        }

        $role = Role::create($request->only(['name', 'slug', 'description']));
        return response()->json(['message' => 'Роль успешно создана', 'data' => $role], 201);
    }

    public function show(string $id): JsonResponse
    {
        $role = Role::with('users')->findOrFail($id);
        return response()->json(['data' => $role]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $role = Role::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:roles,slug,' . $id,
            'description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Ошибка валидации', 'errors' => $validator->errors()], 422);
        }

        $role->update($request->only(['name', 'slug', 'description']));
        return response()->json(['message' => 'Роль успешно обновлена', 'data' => $role->fresh()]);
    }

    public function destroy(string $id): JsonResponse
    {
        $role = Role::findOrFail($id);
        if ($role->users()->count() > 0) {
            return response()->json(['message' => 'Невозможно удалить роль, так как она назначена пользователям'], 422);
        }
        $role->delete();
        return response()->json(['message' => 'Роль успешно удалена']);
    }
}
