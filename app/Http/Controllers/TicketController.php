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
        if ($request->filled('zone')) {
            $query->where('parking_zone', $request->zone);
        }
        
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
                'zone' => $request->zone,
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
            'photo' => 'nullable|image|max:2048',
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

        // Hourly: Redirect to dashboard (no payment needed now)
        // Flat/Overnight: Redirect to payment page
        if ($validated['rate_type'] === 'hourly') {
            return redirect()->route('dashboard')->with('success', 'Hourly ticket generated! Vehicle can park now.');
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

        if ($request->filled('zone')) {
            $query->where('parking_zone', $request->zone);
        }
        
        if ($request->filled('rate_type')) {
            $query->where('rate_type', $request->rate_type);
        }

        if ($request->filled('search')) {
            $query->where('plate_number', 'like', '%' . $request->search . '%');
        }

        $tickets = $query->latest()->paginate(30)->withQueryString();
        $parkingZones = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'];

        return Inertia::render('tickets/history', [
            'tickets' => $tickets,
            'parkingZones' => $parkingZones,
            'filters' => [
                'status' => $request->status,
                'zone' => $request->zone,
                'rate_type' => $request->rate_type,
                'search' => $request->search,
            ],
        ]);
    }
}
