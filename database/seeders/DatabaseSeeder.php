<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\RateSetting;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default admin user
        User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin User',
                'password' => 'admin123',
                'role' => 'admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create default agent user
        User::firstOrCreate(
            ['email' => 'agent@gmail.com'],
            [
                'name' => 'Agent User',
                'password' => 'agent123',
                'role' => 'agent',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create default staff admin user
        User::firstOrCreate(
            ['email' => 'staff@gmail.com'],
            [
                'name' => 'Staff Admin User',
                'password' => 'staff123',
                'role' => 'staff_admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create default rate settings
        RateSetting::firstOrCreate(
            ['rate_type' => 'hourly'],
            [
                'price' => 40.00,
                'duration_minutes' => null,
                'description' => 'Open hours - ₱40 per hour (rounded up)',
                'is_active' => true,
            ]
        );

        RateSetting::firstOrCreate(
            ['rate_type' => 'flat_rate'],
            [
                'price' => 50.00,
                'duration_minutes' => 180, // 3 hours
                'description' => 'Flat rate - ₱50 for 3 hours',
                'is_active' => true,
            ]
        );

        RateSetting::firstOrCreate(
            ['rate_type' => 'overnight'],
            [
                'price' => 2000.00,
                'duration_minutes' => 720, // 12 hours
                'description' => 'Overnight parking - ₱100 for 12 hours',
                'is_active' => true,
            ]
        );
    }
}
