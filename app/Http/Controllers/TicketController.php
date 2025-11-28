<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Payment;
use App\Models\RateSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class TicketController extends Controller
{
    /**
     * Display agent's active tickets
     */
    public function index(Request $request)
    {
        $query = Ticket::with(['agent', 'payment'])
            ->where('agent_id', auth()->id())
            ->where('status', 'active');

        // Apply filters
        if ($request->filled('rate_type')) {
            $query->where('rate_type', $request->rate_type);
        }

        if ($request->filled('search')) {
            $query->where('plate_number', 'like', '%' . $request->search . '%');
        }

        $tickets = $query->latest()->paginate(30)->withQueryString();
        $parkingZones = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'];

        return Inertia::render('tickets/index', [
            'tickets' => $tickets,
            'parkingZones' => $parkingZones,
            'filters' => [
                'rate_type' => $request->rate_type,
                'search' => $request->search,
            ],
        ]);
    }

    /**
     * Show create ticket form
     */
    public function create()
    {
        $rateSettings = RateSetting::where('is_active', true)->get();
        $parkingZones = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'];

        return Inertia::render('tickets/create', [
            'rateSettings' => $rateSettings,
            'parkingZones' => $parkingZones,
        ]);
    }

    /**
     * Store new ticket
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'plate_number' => 'nullable|string|max:20',
            'parking_zone' => 'required|string',
            'rate_type' => 'required|in:hourly,flat_rate,overnight',
            'photo' => 'nullable|image', // Allow any size
        ]);

        $rateSetting = RateSetting::where('rate_type', $validated['rate_type'])->first();

        // Handle photo upload
        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('plates', 'public');
        }

        // Hourly: Save as 'active' (pay on exit)
        // Flat/Overnight: Save as 'pending_payment' (must pay before entry)
        $status = $validated['rate_type'] === 'hourly' ? 'active' : 'pending_payment';

        $ticket = Ticket::create([
            'ticket_id' => Ticket::generateTicketId(),
            'plate_number' => $validated['plate_number'],
            'parking_zone' => $validated['parking_zone'],
            'rate_type' => $validated['rate_type'],
            'price' => $rateSetting->price,
            'entry_time' => now(),
            'status' => $status,
            'agent_id' => auth()->id(),
            'photo_path' => $photoPath,
        ]);

        // Hourly: Redirect to entry receipt (1st receipt with QR)
        // Flat/Overnight: Redirect to payment page
        if ($validated['rate_type'] === 'hourly') {
            return redirect()->route('tickets.entry-receipt', $ticket->id);
        }
        
        return redirect()->route('tickets.payment', $ticket->id);
    }

    /**
     * Show payment page
     */
    public function showPayment(Ticket $ticket)
    {
        return Inertia::render('tickets/payment', [
            'ticket' => $ticket->load('agent'),
        ]);
    }

    /**
     * Process payment
     */
    public function processPayment(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:cash,gcash,card',
        ]);

        // Calculate final amount
        if ($ticket->rate_type === 'hourly') {
            $ticket->exit_time = now();
            $entryTime = \Carbon\Carbon::parse($ticket->entry_time);
            $exitTime = \Carbon\Carbon::parse($ticket->exit_time);
            $durationMinutes = $entryTime->diffInMinutes($exitTime);
            $ticket->duration_minutes = $durationMinutes;
            
            // Calculate hours (round up) - e.g., 61 min = 2 hours = ₱80
            $hours = ceil($durationMinutes / 60);
            $amount = $hours * 40; // ₱40 per hour
            
            $ticket->save();
        } else {
            $amount = $ticket->price;
        }

        // Create payment
        $payment = Payment::create([
            'receipt_number' => Payment::generateReceiptNumber(),
            'ticket_id' => $ticket->id,
            'amount' => $amount,
            'payment_method' => $validated['payment_method'],
            'paid_at' => now(),
            'collected_by' => auth()->id(),
        ]);

        // Update ticket status
        $ticket->update([
            'status' => 'paid',
            'exit_time' => now(),
        ]);

        return redirect()->route('tickets.receipt', $payment->id);
    }

    /**
     * Show receipt
     */
    public function showReceipt(Payment $payment)
    {
        return Inertia::render('tickets/receipt', [
            'payment' => $payment->load(['ticket', 'collector']),
        ]);
    }

    /**
     * Show entry receipt (1st receipt for hourly - before payment)
     */
    public function showEntryReceipt(Ticket $ticket)
    {
        return Inertia::render('tickets/entry-receipt', [
            'ticket' => $ticket->load('agent'),
        ]);
    }

    /**
     * Scan QR code and find ticket
     */
    public function scanTicket(Request $request)
    {
        $validated = $request->validate([
            'ticket_id' => 'required|string',
        ]);

        $ticket = Ticket::where('ticket_id', $validated['ticket_id'])->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found',
            ], 404);
        }

        // Return ticket status and data
        return response()->json([
            'success' => true,
            'ticket' => [
                'id' => $ticket->id,
                'ticket_id' => $ticket->ticket_id,
                'plate_number' => $ticket->plate_number,
                'parking_zone' => $ticket->parking_zone,
                'rate_type' => $ticket->rate_type,
                'price' => $ticket->price,
                'entry_time' => $ticket->entry_time,
                'exit_time' => $ticket->exit_time,
                'status' => $ticket->status,
            ],
            'payment' => $ticket->payment ? [
                'receipt_number' => $ticket->payment->receipt_number,
                'amount' => $ticket->payment->amount,
                'payment_method' => $ticket->payment->payment_method,
                'paid_at' => $ticket->payment->paid_at,
            ] : null,
        ]);
    }

    /**
     * Manually deactivate ticket (mark as completed without payment)
     */
    public function deactivate(Ticket $ticket)
    {
        // Verify agent owns this ticket
        if ($ticket->agent_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Update ticket status
        $ticket->update([
            'status' => 'cancelled',
            'exit_time' => now(),
        ]);

        return redirect()->route('tickets.index')->with('success', 'Ticket deactivated successfully');
    }

    /**
     * Ticket history
     */
    public function history(Request $request)
    {
        $query = Ticket::with(['agent', 'payment'])
            ->where('agent_id', auth()->id())
            ->whereIn('status', ['paid', 'cancelled']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('rate_type')) {
            $query->where('rate_type', $request->rate_type);
        }

        if ($request->filled('search')) {
            $query->where('plate_number', 'like', '%' . $request->search . '%');
        }

        // Date range filter
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Per page parameter
        $perPage = $request->filled('per_page') ? (int) $request->per_page : 30;

        $tickets = $query->latest()->paginate($perPage)->withQueryString();
        $parkingZones = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'];

        return Inertia::render('tickets/history', [
            'tickets' => $tickets,
            'parkingZones' => $parkingZones,
            'filters' => [
                'status' => $request->status,
                'rate_type' => $request->rate_type,
                'search' => $request->search,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'per_page' => $request->per_page,
            ],
        ]);
    }
}
