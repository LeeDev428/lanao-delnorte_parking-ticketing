<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// CSRF cookie initialization endpoint for mobile apps
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['csrf' => csrf_token()]);
})->name('csrf-cookie');

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Route-based image serving for production (no symlink dependency)
Route::get('/storage/plates/{filename}', function ($filename) {
    $path = storage_path('app/public/plates/' . $filename);
    
    if (!file_exists($path)) {
        abort(404);
    }
    
    return response()->file($path, [
        'Content-Type' => mime_content_type($path),
        'Cache-Control' => 'public, max-age=31536000',
    ]);
})->name('plates.show');

Route::middleware(['auth', 'verified'])->group(function () {
    // Agent Dashboard
    Route::get('dashboard', function () {
        $today = now()->startOfDay();
        $user = auth()->user();

        // Real dynamic stats
        $stats = [
            'todayTickets' => \App\Models\Ticket::where('agent_id', $user->id)
                ->whereDate('created_at', $today)
                ->count(),
            'totalCollected' => \App\Models\Payment::where('collected_by', $user->id)
                ->whereDate('paid_at', $today)
                ->sum('amount') ?? 0,
            'activeTickets' => \App\Models\Ticket::where('agent_id', $user->id)
                ->whereIn('status', ['active', 'pending_payment'])
                ->count(),
            'availableSlots' => 200 - \App\Models\Ticket::whereIn('status', ['active', 'pending_payment'])->count(),
        ];

        // Show active hourly tickets (waiting for payment on exit)
        $activeTickets = \App\Models\Ticket::where('agent_id', $user->id)
            ->where('status', 'active')
            ->where('rate_type', 'hourly')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function($ticket) {
                // Calculate duration in minutes
                $entryTime = \Carbon\Carbon::parse($ticket->entry_time);
                $now = \Carbon\Carbon::now();
                $ticket->duration_minutes = $entryTime->diffInMinutes($now);
                return $ticket;
            });

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
        Route::get('/entry-receipt/{ticket}', [App\Http\Controllers\TicketController::class, 'showEntryReceipt'])->name('entry-receipt');
        Route::post('/scan', [App\Http\Controllers\TicketController::class, 'scanTicket'])->name('scan');
        Route::get('/history', [App\Http\Controllers\TicketController::class, 'history'])->name('history');
        
        // Agent Remittance
        Route::get('/remittance', [App\Http\Controllers\ReportController::class, 'myRemittance'])->name('remittance');
    });

    // Settings Routes
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/printer', function () {
            return Inertia::render('settings/printer');
        })->name('printer');
    });

    // Admin routes (accessible by admin and staff_admin)
    Route::prefix('admin')->middleware('can:admin-access')->name('admin.')->group(function () {
        Route::get('dashboard', function (\Illuminate\Http\Request $request) {
            $controller = new \App\Http\Controllers\Admin\AdminTicketController();
            $filter = $request->get('filter', '7days');
            return Inertia::render('admin/dashboard', [
                'stats' => $controller->dashboardStats($filter),
            ]);
        })->name('dashboard');

        Route::get('tickets', [App\Http\Controllers\Admin\AdminTicketController::class, 'index'])->name('tickets');
        Route::get('tickets/export', [App\Http\Controllers\Admin\AdminTicketController::class, 'export'])->name('tickets.export');
        Route::get('tickets/{ticket}', [App\Http\Controllers\Admin\AdminTicketController::class, 'show'])->name('tickets.show');
        Route::patch('tickets/{ticket}', [App\Http\Controllers\Admin\AdminTicketController::class, 'update'])->name('tickets.update');
        Route::delete('tickets/{ticket}', [App\Http\Controllers\Admin\AdminTicketController::class, 'destroy'])->name('tickets.destroy');

        Route::get('revenue', function (\Illuminate\Http\Request $request) {
            $controller = new \App\Http\Controllers\Admin\AdminTicketController();
            return Inertia::render('admin/revenue', [
                'revenue' => $controller->revenueStats($request),
            ]);
        })->name('revenue');
        
        // Collections Reports
        Route::get('reports', [App\Http\Controllers\ReportController::class, 'index'])->name('reports');
        
        // Export Reports
        Route::get('reports/export', [App\Http\Controllers\ReportController::class, 'export'])->name('reports.export');

        // Admin-only routes (rate settings and user management)
        Route::middleware('can:admin')->group(function () {
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

            // User Management
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
                    'role' => 'required|in:admin,staff_admin,agent',
                ]);

                $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);

                \App\Models\User::create($validated);

                return redirect()->route('admin.users');
            })->name('users.store');

            Route::patch('users/{user}', function (\Illuminate\Http\Request $request, \App\Models\User $user) {
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
                    'role' => 'required|in:admin,staff_admin,agent',
                ]);

                $user->update($validated);

                return back();
            })->name('users.update');

            Route::patch('users/{user}/toggle-status', function (\App\Models\User $user) {
                $user->update(['is_active' => !$user->is_active]);
                return back();
            })->name('users.toggle-status');
        });
    });
});

require __DIR__.'/settings.php';
