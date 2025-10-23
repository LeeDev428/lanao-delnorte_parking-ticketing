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
    public function index()
    {
        $tickets = Ticket::with(['agent', 'payment'])
            ->where('agent_id', auth()->id())
            ->where('status', 'active')
            ->latest()
            ->paginate(30);

        return Inertia::render('tickets/index', [
            'tickets' => $tickets,
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

        // Create ticket
        $ticket = Ticket::create([
            'ticket_id' => Ticket::generateTicketId(),
            'plate_number' => $validated['plate_number'],
            'parking_zone' => $validated['parking_zone'],
            'rate_type' => $validated['rate_type'],
            'price' => $rateSetting->price,
            'entry_time' => now(),
            'status' => 'active',
            'agent_id' => auth()->id(),
            'photo_path' => $photoPath,
        ]);

        // If flat_rate or overnight, redirect to payment
        if (in_array($validated['rate_type'], ['flat_rate', 'overnight'])) {
            return redirect()->route('tickets.payment', $ticket->id);
        }

        // For hourly, just show success
        return redirect()->route('dashboard')->with('success', 'Ticket generated successfully!');
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
            $ticket->duration_minutes = $ticket->calculateDuration();
            $rateSetting = RateSetting::where('rate_type', 'hourly')->first();
            $amount = $rateSetting->calculatePrice($ticket->duration_minutes);
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
    public function history()
    {
        $tickets = Ticket::with(['agent', 'payment'])
            ->where('agent_id', auth()->id())
            ->whereIn('status', ['paid', 'cancelled'])
            ->latest()
            ->paginate(30);

        return Inertia::render('tickets/history', [
            'tickets' => $tickets,
        ]);
    }
}
