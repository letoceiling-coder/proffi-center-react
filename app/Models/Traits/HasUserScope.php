<?php

namespace App\Models\Traits;

use App\Models\Scopes\UserScope;
use Illuminate\Database\Eloquent\Builder;

trait HasUserScope
{
    protected static function bootHasUserScope(): void
    {
        static::addGlobalScope(new UserScope);
    }

    public static function withoutUserScope(): Builder
    {
        return static::withoutGlobalScope(UserScope::class);
    }

    public static function forUser($userId): Builder
    {
        return static::withoutGlobalScope(UserScope::class)
            ->where(static::getTableName() . '.user_id', $userId);
    }

    public static function allUsers(): Builder
    {
        return static::withoutGlobalScope(UserScope::class);
    }

    protected static function getTableName(): string
    {
        return (new static)->getTable();
    }
}
