<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Display collections report (Admin only)
     */
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::today()->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->toDateString());
        $agentId = $request->input('agent_id');

        $query = Payment::with(['ticket', 'collector'])
            ->whereBetween('paid_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);

        if ($agentId) {
            $query->where('collected_by', $agentId);
        }

        $payments = $query->orderBy('paid_at', 'desc')->get();

        // Calculate totals by payment method
        $totalCash = $payments->where('payment_method', 'cash')->sum('amount');
        $totalGcash = $payments->where('payment_method', 'gcash')->sum('amount');
        $totalCard = $payments->where('payment_method', 'card')->sum('amount');
        $grandTotal = $payments->sum('amount');

        // Get agent collections summary
        $agentSummary = Payment::with('collector')
            ->whereBetween('paid_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ])
            ->selectRaw('collected_by, COUNT(*) as transaction_count, SUM(amount) as total_amount')
            ->groupBy('collected_by')
            ->get()
            ->map(function ($item) {
                return [
                    'agent_id' => $item->collected_by,
                    'agent_name' => $item->collector->name,
                    'transaction_count' => $item->transaction_count,
                    'total_amount' => $item->total_amount,
                ];
            });

        // Get all agents for filter
        $agents = User::where('role', 'agent')
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/reports', [
            'payments' => $payments->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'receipt_number' => $payment->receipt_number,
                    'amount' => $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'paid_at' => $payment->paid_at->format('Y-m-d H:i:s'),
                    'collector_name' => $payment->collector->name,
                    'plate_number' => $payment->ticket->plate_number ?? 'N/A',
                ];
            }),
            'summary' => [
                'total_cash' => $totalCash,
                'total_gcash' => $totalGcash,
                'total_card' => $totalCard,
                'grand_total' => $grandTotal,
                'transaction_count' => $payments->count(),
            ],
            'agentSummary' => $agentSummary,
            'agents' => $agents,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'agent_id' => $agentId,
            ],
        ]);
    }

    /**
     * Display agent's remittance (Agent only)
     */
    public function myRemittance(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::today()->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->toDateString());

        $payments = Payment::with(['ticket'])
            ->where('collected_by', auth()->id())
            ->whereBetween('paid_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ])
            ->orderBy('paid_at', 'desc')
            ->get();

        // Calculate totals by payment method
        $totalCash = $payments->where('payment_method', 'cash')->sum('amount');
        $totalGcash = $payments->where('payment_method', 'gcash')->sum('amount');
        $totalCard = $payments->where('payment_method', 'card')->sum('amount');
        $grandTotal = $payments->sum('amount');

        // Cash to remit (cash only, gcash/card are digital)
        $cashToRemit = $totalCash;

        return Inertia::render('tickets/remittance', [
            'payments' => $payments->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'receipt_number' => $payment->receipt_number,
                    'amount' => $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'paid_at' => $payment->paid_at->format('Y-m-d H:i:s'),
                    'plate_number' => $payment->ticket->plate_number ?? 'N/A',
                ];
            }),
            'summary' => [
                'total_cash' => $totalCash,
                'total_gcash' => $totalGcash,
                'total_card' => $totalCard,
                'grand_total' => $grandTotal,
                'cash_to_remit' => $cashToRemit,
                'transaction_count' => $payments->count(),
            ],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}
