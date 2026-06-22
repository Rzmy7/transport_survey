<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $index = public_path('index.html');

    if (file_exists($index)) {
        return response(file_get_contents($index), 200)
            ->header('Content-Type', 'text/html; charset=UTF-8');
    }

    return view('welcome');
});

Route::fallback(function () {
    $index = public_path('index.html');

    if (file_exists($index)) {
        return response(file_get_contents($index), 200)
            ->header('Content-Type', 'text/html; charset=UTF-8');
    }

    abort(404);
});
