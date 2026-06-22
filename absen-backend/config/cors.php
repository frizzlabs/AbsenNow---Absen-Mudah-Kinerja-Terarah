<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost',
        'https://localhost',
        'http://localhost:8100',
        'http://localhost:4200',
        'capacitor://localhost',
        'ionic://localhost',
        env('FRONTEND_URL', 'https://absennow.jaritechnology.com'),
    ],

    'allowed_origins_patterns' => [
        '/^https?:\/\/localhost(:\d+)?$/',
        '/^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/',
        '/^https?:\/\/([a-z0-9-]+\.)?absennow\.id(:\d+)?$/',
        '/^https?:\/\/([a-z0-9-]+\.)?absennow\.jaritechnology\.com(:\d+)?$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];  
