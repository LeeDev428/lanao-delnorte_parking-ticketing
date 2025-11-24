<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RateSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('rate_settings')->insert([
            [
                'rate_type' => 'hourly',
                'price' => 40.00,
                'duration_minutes' => null,
                'description' => 'Open hours - ₱40 per hour',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'rate_type' => 'flat_rate',
                'price' => 50.00,
                'duration_minutes' => 180,
                'description' => 'Flat rate - ₱50 for 3 hours',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'rate_type' => 'overnight',
                'price' => 2000.00,
                'duration_minutes' => 720,
                'description' => 'Overnight - ₱100 for 12 hours',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
