<?php

return [
    'client_id' => env('PAYPAL_CLIENT_ID'),
    'client_secret' => env('PAYPAL_CLIENT_SECRET'),
    'settings' => [
        'mode' => env('PAYPAL_MODE', 'sandbox'), // sandbox ou live
        'http.ConnectionTimeOut' => 1000,
        'http.Retry' => 1,
        'log.LogEnabled' => true,
        'log.FileName' => storage_path('logs/paypal.log'),
        'log.LogLevel' => 'ERROR'
    ]
];