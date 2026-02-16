<?php

use Illuminate\Support\Facades\Route;

// Route principale (racine) : charge la SPA React
Route::get('/', function () {
    return view('app'); // ta vue blade qui charge React (ex: resources/views/app.blade.php)
});

// Route de login (aussi gérée côté React)
Route::get('/login', function () {
    return view('app');
})->name('login');

// Routes admin protégées : on sert la même vue SPA React
Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/{any?}', function () {
        return view('app');
    })->where('any', '.*');
});

// Route catch-all pour React Router côté client
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
