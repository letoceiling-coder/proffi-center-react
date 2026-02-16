<?php

return [
    'upload' => [
        'max_size' => env('MEDIA_MAX_SIZE_KB', 10240), // 10 MB in KB
        'allow_all_types' => env('MEDIA_ALLOW_ALL_TYPES', false),
        'allowed_mime_types' => [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'video/mp4',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
    ],
    'pagination' => [
        'per_page_default' => 20,
        'per_page_max' => 100,
    ],
];
