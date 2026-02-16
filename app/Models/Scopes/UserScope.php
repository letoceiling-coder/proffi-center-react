<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Schema;

class UserScope implements Scope
{
    private static array $hasUserIdColumnCache = [];

    public function apply(Builder $builder, Model $model): void
    {
        if (!auth()->check()) {
            return;
        }

        $table = $model->getTable();
        if (!$this->hasUserIdColumn($table)) {
            return;
        }

        if ($table === 'folders') {
            $builder->where(function ($query) use ($table) {
                $query->where($table . '.is_trash', 1)
                    ->orWhere(function ($q) use ($table) {
                        $q->where(function ($subQ) use ($table) {
                            $subQ->where($table . '.is_trash', '!=', 1)
                                ->orWhereNull($table . '.is_trash');
                        })
                        ->where(function ($subQ) use ($table) {
                            $subQ->where($table . '.user_id', auth()->id())
                                ->orWhereNull($table . '.user_id');
                        });
                    });
            });
        } elseif ($table === 'media') {
            $builder->where(function ($query) use ($table) {
                $query->where($table . '.user_id', auth()->id())
                    ->orWhereNull($table . '.user_id');
            });
        } else {
            $builder->where($table . '.user_id', auth()->id());
        }
    }

    private function hasUserIdColumn(string $table): bool
    {
        if (!isset(self::$hasUserIdColumnCache[$table])) {
            self::$hasUserIdColumnCache[$table] = Schema::hasColumn($table, 'user_id');
        }
        return self::$hasUserIdColumnCache[$table];
    }
}
