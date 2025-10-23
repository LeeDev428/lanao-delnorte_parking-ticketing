<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_id',
        'plate_number',
        'parking_zone',
        'rate_type',
        'price',
        'entry_time',
        'exit_time',
        'duration_minutes',
        'status',
        'agent_id',
        'photo_path',
    ];

    protected $casts = [
        'entry_time' => 'datetime',
        'exit_time' => 'datetime',
        'price' => 'decimal:2',
    ];

    /**
     * Get the agent who created this ticket
     */
    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    /**
     * Get the payment for this ticket
     */
    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * Calculate duration in minutes
     */
    public function calculateDuration()
    {
        if ($this->exit_time) {
            return $this->entry_time->diffInMinutes($this->exit_time);
        }
        return $this->entry_time->diffInMinutes(now());
    }

    /**
     * Generate unique ticket ID
     */
    public static function generateTicketId(): string
    {
        $prefix = 'P' . date('y') . '-';
        $lastTicket = self::where('ticket_id', 'LIKE', $prefix . '%')
            ->orderBy('id', 'desc')
            ->first();

        if ($lastTicket) {
            $lastNumber = intval(substr($lastTicket->ticket_id, -4));
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . $newNumber;
    }
}
