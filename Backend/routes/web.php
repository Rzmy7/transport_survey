<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $index = public_path('index.html');

    if (file_exists($index)) {
        return response()->file($index);
    }

    return view('welcome');
});

Route::fallback(function () {
    $index = public_path('index.html');

    if (file_exists($index)) {
        return response()->file($index);
    }

    abort(404);
});
