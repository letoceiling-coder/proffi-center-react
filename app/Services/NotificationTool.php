<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Collection;

class NotificationTool
{
    public function getNotifications(?User $user = null, int $limit = 10, bool $onlyUnread = true): Collection
    {
        if (!$user) {
            return collect([]);
        }
        $query = Notification::where('user_id', $user->id)->orderBy('created_at', 'desc');
        if ($onlyUnread) {
            $query->where('read', false);
        }
        return $query->limit($limit)->get();
    }

    public function addNotification(User $user, string $title, string $message, ?string $type = 'info'): Notification
    {
        return Notification::create([
            'user_id' => $user->id,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'read' => false,
        ]);
    }

    public function markAsRead(User $user, int $notificationId): bool
    {
        $notification = Notification::where('user_id', $user->id)->where('id', $notificationId)->first();
        return $notification ? $notification->markAsRead() : false;
    }

    public function getUnreadCount(?User $user = null): int
    {
        if (!$user) {
            return 0;
        }
        return Notification::where('user_id', $user->id)->where('read', false)->count();
    }

    public function getAllNotifications(?User $user = null, array $filters = [], int $perPage = 20)
    {
        if (!$user) {
            return new \Illuminate\Pagination\LengthAwarePaginator([], 0, $perPage);
        }
        $query = Notification::where('user_id', $user->id);
        if (isset($filters['read'])) {
            $query->where('read', $filters['read']);
        }
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")->orWhere('message', 'like', "%{$search}%");
            });
        }
        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function deleteNotification(User $user, int $notificationId): bool
    {
        $notification = Notification::where('user_id', $user->id)->where('id', $notificationId)->first();
        return $notification ? (bool) $notification->delete() : false;
    }

    public function getNotificationsJson(?User $user = null, int $limit = 10): array
    {
        return $this->getNotifications($user, $limit)->map(function ($n) {
            return [
                'id' => $n->id,
                'title' => $n->title,
                'message' => $n->message,
                'type' => $n->type,
                'read' => $n->read,
                'created_at' => $n->created_at->toDateTimeString(),
                'created_at_human' => $n->created_at->diffForHumans(),
            ];
        })->toArray();
    }
}
