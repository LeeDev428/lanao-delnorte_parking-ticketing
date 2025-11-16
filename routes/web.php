<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Agent Dashboard
    Route::get('dashboard', function () {
        $today = now()->startOfDay();
        $user = auth()->user();

        $stats = [
            'todayTickets' => \App\Models\Ticket::where('agent_id', $user->id)->whereDate('created_at', $today)->count(),
            'totalCollected' => \App\Models\Payment::where('collected_by', $user->id)->whereDate('paid_at', $today)->sum('amount'),
            'activeTickets' => \App\Models\Ticket::where('agent_id', $user->id)->where('status', 'active')->count(),
            'availableSlots' => 200 - \App\Models\Ticket::where('status', 'active')->count(),
        ];

        $activeTickets = \App\Models\Ticket::where('agent_id', $user->id)
            ->where('status', 'active')
            ->latest()
            ->limit(3)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'activeTickets' => $activeTickets,
        ]);
    })->name('dashboard');

    // Ticket Routes (Agent)
    Route::prefix('tickets')->name('tickets.')->group(function () {
        Route::get('/', [App\Http\Controllers\TicketController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\TicketController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\TicketController::class, 'store'])->name('store');
        Route::get('/{ticket}/payment', [App\Http\Controllers\TicketController::class, 'showPayment'])->name('payment');
        Route::post('/{ticket}/payment', [App\Http\Controllers\TicketController::class, 'processPayment'])->name('payment.process');
        Route::post('/{ticket}/deactivate', [App\Http\Controllers\TicketController::class, 'deactivate'])->name('deactivate');
        Route::get('/receipt/{payment}', [App\Http\Controllers\TicketController::class, 'showReceipt'])->name('receipt');
        Route::get('/history', [App\Http\Controllers\TicketController::class, 'history'])->name('history');
        
        // Agent Remittance
        Route::get('/remittance', [App\Http\Controllers\ReportController::class, 'myRemittance'])->name('remittance');
    });

    // Admin routes
    Route::prefix('admin')->middleware('can:admin')->name('admin.')->group(function () {
        Route::get('dashboard', function () {
            $controller = new \App\Http\Controllers\Admin\AdminTicketController();
            return Inertia::render('admin/dashboard', [
                'stats' => $controller->dashboardStats(),
            ]);
        })->name('dashboard');

        Route::get('tickets', [App\Http\Controllers\Admin\AdminTicketController::class, 'index'])->name('tickets');
        Route::get('tickets/{ticket}', [App\Http\Controllers\Admin\AdminTicketController::class, 'show'])->name('tickets.show');
        Route::patch('tickets/{ticket}', [App\Http\Controllers\Admin\AdminTicketController::class, 'update'])->name('tickets.update');
        Route::delete('tickets/{ticket}', [App\Http\Controllers\Admin\AdminTicketController::class, 'destroy'])->name('tickets.destroy');

        // Rate Settings Management
        Route::get('rate-settings', function () {
            return Inertia::render('admin/rate-settings', [
                'rateSettings' => \App\Models\RateSetting::all(),
            ]);
        })->name('rate-settings');

        Route::post('rate-settings', function (\Illuminate\Http\Request $request) {
            $validated = $request->validate([
                'rate_type' => 'required|in:hourly,flat_rate,overnight|unique:rate_settings,rate_type',
                'price' => 'required|numeric|min:0',
                'duration_minutes' => 'nullable|integer|min:0',
                'description' => 'required|string|max:255',
                'is_active' => 'boolean',
            ]);

            \App\Models\RateSetting::create($validated);

            return redirect()->back()->with('success', 'Rate created successfully!');
        })->name('rate-settings.store');

        Route::patch('rate-settings/{rateSetting}', function (\Illuminate\Http\Request $request, \App\Models\RateSetting $rateSetting) {
            $validated = $request->validate([
                'price' => 'required|numeric|min:0',
                'duration_minutes' => 'nullable|integer|min:0',
                'description' => 'required|string|max:255',
            ]);

            $rateSetting->update($validated);

            return redirect()->back()->with('success', 'Rate updated successfully!');
        })->name('rate-settings.update');

        Route::delete('rate-settings/{rateSetting}', function (\App\Models\RateSetting $rateSetting) {
            $rateSetting->delete();

            return redirect()->back()->with('success', 'Rate deleted successfully!');
        })->name('rate-settings.destroy');

        Route::get('revenue', function () {
            $controller = new \App\Http\Controllers\Admin\AdminTicketController();
            return Inertia::render('admin/revenue', [
                'revenue' => $controller->revenueStats(),
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
