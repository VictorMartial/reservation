<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChambreController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| All API routes are prefixed with '/api' and use Sanctum for authentication.
| Role-based middleware ('role:admin', 'role:receptionist,admin') is used
| to restrict access to specific routes.
|
*/

// Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('login', [AuthController::class, 'login'])->name('auth.login');
    Route::post('refresh', [AuthController::class, 'refresh'])->name('auth.refresh');
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::get('user', [AuthController::class, 'user'])->name('auth.user');
    });
});

// Public Routes (No Authentication Required)
Route::prefix('public')->group(function () {
    // Menu Routes
    Route::get('menus', [MenuController::class, 'index'])->name('public.menus.index');
    Route::get('menus/categorie/{categorie}', [MenuController::class, 'parCategorie'])->name('public.menus.byCategory');
    
    // Room Routes
    Route::get('chambres', [ChambreController::class, 'index'])->name('public.chambres.index');
    Route::post('chambres/disponibles', [ChambreController::class, 'chambresDisponibles'])->name('public.chambres.available');
    
    // Table Routes
    Route::get('tables', [TableController::class, 'index'])->name('public.tables.index');
    Route::post('tables/disponibles', [TableController::class, 'tablesDisponibles'])->name('public.tables.available');
});

// Protected Routes (Authentication Required)
Route::middleware('auth:sanctum')->group(function () {
    // User Profile
    Route::get('profile', [UserController::class, 'profile'])->name('user.profile');
    
    // Room Routes
    Route::apiResource('chambres', ChambreController::class)->names('chambres');
    Route::post('chambres/{chambre}/check-disponibilite', [ChambreController::class, 'checkDisponibilite'])->name('chambres.checkAvailability');
    Route::post('chambres/disponibles', [ChambreController::class, 'chambresDisponibles'])->name('chambres.available');
    
    // Table Routes
    Route::apiResource('tables', TableController::class)->names('tables');
    Route::post('tables/{table}/check-disponibilite', [TableController::class, 'checkDisponibilite'])->name('tables.checkAvailability');
    Route::post('tables/disponibles', [TableController::class, 'tablesDisponibles'])->name('tables.available');
    
    // Menu Routes
    Route::apiResource('menus', MenuController::class)->names('menus');
    Route::get('menus/categorie/{categorie}', [MenuController::class, 'parCategorie'])->name('menus.byCategory');
    
    // Reservation Routes
    Route::apiResource('reservations', ReservationController::class)->names('reservations');
    Route::patch('reservations/{reservation}/confirmer', [ReservationController::class, 'confirmer'])->name('reservations.confirm')->middleware('role:receptionist,admin');
    Route::patch('reservations/{reservation}/annuler', [ReservationController::class, 'annuler'])->name('reservations.cancel')->middleware('role:receptionist,admin');
    
    // Payment Routes
    Route::apiResource('paiements', PaiementController::class);
    Route::patch('paiements/{paiement}/valider', [PaiementController::class, 'valider']);
    Route::patch('paiements/{paiement}/rembourser', [PaiementController::class, 'rembourser']); 
    
    Route::get('/paypal/success/{paiement}', [PaiementController::class, 'paypalSuccess'])->name('paypal.success');
    Route::get('/paypal/cancel/{paiement}', [PaiementController::class, 'paypalCancel'])->name('paypal.cancel');

    // User Routes (Admin Only)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('users', UserController::class)->names('users');
        
        // Admin Dashboard
        Route::get('admin/dashboard', function () {
            return response()->json([
                'total_reservations' => \App\Models\Reservation::count(),
                'reservations_confirmees' => \App\Models\Reservation::where('statut', 'confirmee')->count(),
                'total_revenus' => \App\Models\Paiement::where('statut', 'valide')->sum('montant'),
                'chambres_occupees' => \App\Models\Chambre::whereHas('reservations', function ($q) {
                    $q->where('statut', 'confirmee')
                      ->whereDate('date_debut', '<=', now())
                      ->whereDate('date_fin', '>=', now());
                })->count(),
            ]);
        })->name('admin.dashboard');
    });
    
    // Receptionist and Admin Routes
    Route::middleware('role:receptionist,admin')->prefix('reception')->group(function () {
        Route::get('reservations/today', function () {
            return response()->json(
                \App\Models\Reservation::with(['user', 'chambre', 'table'])
                    ->whereDate('date_debut', now())
                    ->get()
            );
        })->name('reception.reservations.today');
        
        Route::get('reservations/pending', function () {
            return response()->json(
                \App\Models\Reservation::with(['user', 'chambre', 'table'])
                    ->where('statut', 'en_attente')
                    ->get()
            );
        })->name('reception.reservations.pending');
    });
});