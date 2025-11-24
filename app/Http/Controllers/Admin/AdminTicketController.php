<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Payment;
use App\Models\RateSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminTicketController extends Controller
{
    /**
     * Display all tickets
     */
    public function index(Request $request)
    {
        $query = Ticket::with(['agent', 'payment', 'rateSetting']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('ticket_id', 'like', "%{$request->search}%")
                  ->orWhere('plate_number', 'like', "%{$request->search}%");
            });
        }

        $tickets = $query->latest()->paginate(20);

        // Add duration_minutes calculation for each ticket
        $tickets->getCollection()->transform(function($ticket) {
            if ($ticket->rate_type === 'hourly' && $ticket->entry_time) {
                // For hourly: calculate time elapsed
                $entryTime = \Carbon\Carbon::parse($ticket->entry_time);
                $exitTime = $ticket->exit_time ? \Carbon\Carbon::parse($ticket->exit_time) : now();
                $ticket->duration_minutes = $entryTime->diffInMinutes($exitTime);
            } elseif ($ticket->rateSetting && $ticket->rateSetting->duration_minutes) {
                // For flat/overnight: use rate setting duration
                $ticket->duration_minutes = $ticket->rateSetting->duration_minutes;
            } else {
                $ticket->duration_minutes = null;
            }
            return $ticket;
        });

        return Inertia::render('admin/tickets', [
            'tickets' => $tickets,
        ]);
    }

    /**
     * Show single ticket
     */
    public function show(Ticket $ticket)
    {
        return Inertia::render('admin/tickets/show', [
            'ticket' => $ticket->load(['agent', 'payment']),
        ]);
    }

    /**
     * Update ticket
     */
    public function update(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'plate_number' => 'nullable|string|max:20',
            'parking_zone' => 'required|string',
            'status' => 'required|in:active,paid,cancelled',
        ]);

        $ticket->update($validated);

        return back()->with('success', 'Ticket updated successfully!');
    }

    /**
     * Cancel ticket
     */
    public function destroy(Ticket $ticket)
    {
        $ticket->update(['status' => 'cancelled']);

        return back()->with('success', 'Ticket cancelled successfully!');
    }

    /**
     * Dashboard stats
     */
    public function dashboardStats()
    {
        $today = now()->startOfDay();

        // Get active tickets with duration calculation
        $activeTickets = Ticket::where('status', 'active')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function($ticket) {
                $entryTime = \Carbon\Carbon::parse($ticket->entry_time);
                $ticket->duration_minutes = $entryTime->diffInMinutes(now());
                return $ticket;
            });

        $stats = [
            'todayTickets' => Ticket::whereDate('created_at', $today)->count(),
            'todayRevenue' => Payment::whereDate('paid_at', $today)->sum('amount') ?? 0,
            'activeTickets' => Ticket::where('status', 'active')->count(),
            'availableSlots' => 200 - Ticket::where('status', 'active')->count(),
            'totalSlots' => 200,
            'paidTickets' => Ticket::whereDate('created_at', $today)->where('status', 'paid')->count(),
            'cancelledTickets' => Ticket::whereDate('created_at', $today)->where('status', 'cancelled')->count(),
            'totalRevenue' => Payment::sum('amount') ?? 0,
            'activeTicketsList' => $activeTickets,
        ];

        return $stats;
    }

    /**
     * Revenue stats
     */
    public function revenueStats()
    {
        $today = now();
        
        return [
            'today' => Payment::whereDate('paid_at', $today)->sum('amount'),
            'week' => Payment::whereBetween('paid_at', [$today->copy()->startOfWeek(), $today->copy()->endOfWeek()])->sum('amount'),
            'month' => Payment::whereMonth('paid_at', $today->month)->sum('amount'),
            'year' => Payment::whereYear('paid_at', $today->year)->sum('amount'),
            'byPaymentMethod' => [
                'cash' => Payment::where('payment_method', 'cash')->whereMonth('paid_at', $today->month)->sum('amount'),
                'gcash' => Payment::where('payment_method', 'gcash')->whereMonth('paid_at', $today->month)->sum('amount'),
                'card' => Payment::where('payment_method', 'card')->whereMonth('paid_at', $today->month)->sum('amount'),
            ],
        ];
    }
}
