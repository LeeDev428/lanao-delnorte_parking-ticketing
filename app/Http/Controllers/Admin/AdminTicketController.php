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

        // Filter by date range
        if ($request->has('start_date') && $request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date') && $request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Search
        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('ticket_id', 'like', "%{$request->search}%")
                  ->orWhere('plate_number', 'like', "%{$request->search}%");
            });
        }

        $perPage = $request->get('per_page', 20);
        $tickets = $query->latest()->paginate($perPage)->withQueryString();

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
            'filters' => $request->only(['status', 'search', 'start_date', 'end_date', 'per_page']),
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
    public function dashboardStats($filter = '7days')
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

        // Get revenue data based on filter from payments table (paid_at column)
        $revenueData = [
            'dates' => [],
            'amounts' => []
        ];
        
        switch ($filter) {
            case '7days':
                // Last 7 days - daily data
                for ($i = 6; $i >= 0; $i--) {
                    $date = now()->subDays($i);
                    $revenueData['dates'][] = $date->format('M d');
                    $revenueData['amounts'][] = (float) Payment::whereDate('paid_at', $date)->sum('amount') ?: 0;
                }
                break;
                
            case '30days':
                // Last 30 days - every 3 days
                for ($i = 27; $i >= 0; $i -= 3) {
                    $date = now()->subDays($i);
                    $revenueData['dates'][] = $date->format('M d');
                    // Sum revenue for 3-day period
                    $amount = Payment::whereBetween('paid_at', [
                        $date->copy()->startOfDay(),
                        $date->copy()->addDays(2)->endOfDay()
                    ])->sum('amount');
                    $revenueData['amounts'][] = (float) $amount ?: 0;
                }
                break;
                
            case '90days':
                // Last 90 days - weekly data
                for ($i = 84; $i >= 0; $i -= 7) {
                    $date = now()->subDays($i);
                    $revenueData['dates'][] = $date->format('M d');
                    // Sum revenue for 7-day period
                    $amount = Payment::whereBetween('paid_at', [
                        $date->copy()->startOfDay(),
                        $date->copy()->addDays(6)->endOfDay()
                    ])->sum('amount');
                    $revenueData['amounts'][] = (float) $amount ?: 0;
                }
                break;
                
            case '12months':
                // Last 12 months - monthly data
                for ($i = 11; $i >= 0; $i--) {
                    $date = now()->subMonths($i);
                    $revenueData['dates'][] = $date->format('M y');
                    // Sum revenue for entire month
                    $amount = Payment::whereYear('paid_at', $date->year)
                        ->whereMonth('paid_at', $date->month)
                        ->sum('amount');
                    $revenueData['amounts'][] = (float) $amount ?: 0;
                }
                break;
                
            case '36months':
                // Last 36 months - quarterly data (every 3 months)
                for ($i = 33; $i >= 0; $i -= 3) {
                    $date = now()->subMonths($i);
                    $revenueData['dates'][] = $date->format('M y');
                    // Sum revenue for 3-month period
                    $startDate = $date->copy()->startOfMonth();
                    $endDate = $date->copy()->addMonths(2)->endOfMonth();
                    $amount = Payment::whereBetween('paid_at', [
                        $startDate,
                        $endDate
                    ])->sum('amount');
                    $revenueData['amounts'][] = (float) $amount ?: 0;
                }
                break;
        }

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
            'revenueData' => $revenueData,
        ];

        return $stats;
    }

    /**
     * Revenue stats
     */
    public function revenueStats(Request $request)
    {
        $today = now();
        
        // Date range for filtering (default: this month)
        $startDate = $request->get('start_date') ? \Carbon\Carbon::parse($request->get('start_date')) : $today->copy()->startOfMonth();
        $endDate = $request->get('end_date') ? \Carbon\Carbon::parse($request->get('end_date')) : $today->copy()->endOfMonth();
        
        // Get recent transactions with real data from payments table
        $recentTransactions = Payment::with(['ticket', 'collectedBy'])
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->latest('paid_at')
            ->limit(10)
            ->get()
            ->map(function($payment) {
                return [
                    'id' => $payment->id,
                    'ticket_id' => $payment->ticket ? $payment->ticket->ticket_id : 'N/A',
                    'amount' => $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'paid_at' => $payment->paid_at->format('Y-m-d H:i:s'),
                    'collected_by' => $payment->collectedBy ? $payment->collectedBy->name : 'N/A',
                ];
            });
        
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
            'recentTransactions' => $recentTransactions,
            'dateRange' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ];
    }

    /**
     * Export tickets
     */
    public function export(Request $request)
    {
        $query = Ticket::with(['agent', 'payment']);

        // Apply same filters as index
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('ticket_id', 'like', "%{$request->search}%")
                  ->orWhere('plate_number', 'like', "%{$request->search}%");
            });
        }

        $tickets = $query->latest()->get();

        // Generate CSV
        $filename = 'tickets_export_' . now()->format('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($tickets) {
            $file = fopen('php://output', 'w');
            
            // Add CSV headers
            fputcsv($file, [
                'Ticket ID',
                'Plate Number',
                'Zone',
                'Rate Type',
                'Price',
                'Entry Time',
                'Exit Time',
                'Duration (mins)',
                'Status',
                'Agent',
                'Payment Method',
                'Payment Amount'
            ]);

            // Add data rows
            foreach ($tickets as $ticket) {
                fputcsv($file, [
                    $ticket->ticket_id,
                    $ticket->plate_number,
                    $ticket->parking_zone,
                    ucfirst(str_replace('_', ' ', $ticket->rate_type)),
                    $ticket->price,
                    $ticket->entry_time ? $ticket->entry_time->format('Y-m-d H:i:s') : '',
                    $ticket->exit_time ? $ticket->exit_time->format('Y-m-d H:i:s') : '',
                    $ticket->duration_minutes ?? '',
                    ucfirst($ticket->status),
                    $ticket->agent->name ?? '',
                    $ticket->payment->payment_method ?? '',
                    $ticket->payment->amount ?? '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
