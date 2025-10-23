<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Admin routes
    Route::prefix('admin')->middleware('can:admin')->name('admin.')->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('admin/dashboard', [
                'stats' => [
                    'todayTickets' => 124,
                    'totalRevenue' => 940,
                    'activeTickets' => 3,
                    'availableSlots' => 37,
                    'totalSlots' => 200,
                    'todayRevenue' => 940,
                    'paidTickets' => 121,
                    'cancelledTickets' => 0,
                ],
            ]);
        })->name('dashboard');

        Route::get('tickets', function () {
            return Inertia::render('admin/tickets', [
                'tickets' => [],
            ]);
        })->name('tickets');

        Route::get('revenue', function () {
            return Inertia::render('admin/revenue', [
                'revenue' => [
                    'today' => 940,
                    'week' => 5240,
                    'month' => 21560,
                    'year' => 256800,
                    'byPaymentMethod' => [
                        'cash' => 15840,
                        'gcash' => 3920,
                        'card' => 1800,
                    ],
                ],
            ]);
        })->name('revenue');

        Route::get('users', function () {
            return Inertia::render('admin/users', [
                'users' => \App\Models\User::all(),
            ]);
        })->name('users');

        Route::post('users', function (\Illuminate\Http\Request $request) {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'role' => 'required|in:admin,agent',
            ]);

            \App\Models\User::create($validated);

            return redirect()->route('admin.users');
        })->name('users.store');

        Route::patch('users/{user}/toggle-status', function (\App\Models\User $user) {
            $user->update(['is_active' => !$user->is_active]);
            return back();
        })->name('users.toggle-status');
    });
});

require __DIR__.'/settings.php';
