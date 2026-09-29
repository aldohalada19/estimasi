<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SimulationController;

// Web View
Route::get('/', [SimulationController::class, 'index'])->name('simulasi.index');

// Simulation API Endpoints
Route::prefix('api')->group(function () {
    Route::get('/simulations', [SimulationController::class, 'getSimulations']);
    Route::post('/simulations', [SimulationController::class, 'store']);
    Route::delete('/simulations/{id}', [SimulationController::class, 'destroy']);
});
