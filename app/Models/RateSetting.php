<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RateSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'rate_type',
        'price',
        'duration_minutes',
        'description',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Calculate total price for given duration
     */
    public function calculatePrice(int $durationMinutes): float
    {
        if ($this->rate_type === 'hourly') {
            // Round up to next hour (1hr 1min = 2hrs)
            $hours = ceil($durationMinutes / 60);
            return (float)($hours * $this->price);
        }

        // Flat rate and overnight have fixed prices
        return (float)$this->price;
    }
}
