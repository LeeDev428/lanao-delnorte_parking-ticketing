<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Define admin gate (admin only)
        Gate::define('admin', function ($user) {
            return $user->role === 'admin';
        });

        // Define admin access gate (admin or staff_admin)
        Gate::define('admin-access', function ($user) {
            return in_array($user->role, ['admin', 'staff_admin']);
        });

        // Define agent gate
        Gate::define('agent', function ($user) {
            return $user->role === 'agent';
        });
    }
}
