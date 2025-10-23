import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';
import { Clock, MapPin, Car, CreditCard, Wallet, Banknote } from 'lucide-react';
import { useState } from 'react';

interface Ticket {
    id: number;
    ticket_id: string;
    plate_number: string;
    parking_zone: string;
    rate_type: 'hourly' | 'flat_rate' | 'overnight';
    price: number;
    entry_time: string;
    duration_minutes?: number;
    status: string;
}

interface PaymentProps {
    ticket: Ticket;
}

export default function TicketPayment({ ticket }: PaymentProps) {
    const [selectedMethod, setSelectedMethod] = useState<'cash' | 'gcash' | 'card'>('cash');
    const [processing, setProcessing] = useState(false);

    // Calculate time elapsed
    const entryTime = new Date(ticket.entry_time);
    const now = new Date();
    const elapsedMinutes = Math.floor((now.getTime() - entryTime.getTime()) / (1000 * 60));
    const hours = Math.floor(elapsedMinutes / 60);
    const minutes = elapsedMinutes % 60;

    // Calculate amount for hourly
    let amount = ticket.price;
    if (ticket.rate_type === 'hourly') {
        const chargeableHours = Math.ceil(elapsedMinutes / 60) || 1;
        amount = chargeableHours * 40; // ₱40 per hour
    }

    const handlePayment = () => {
        setProcessing(true);
        router.post(`/tickets/${ticket.id}/payment`, {
            payment_method: selectedMethod,
        }, {
            onFinish: () => setProcessing(false),
        });
    };

    const paymentMethods = [
        { id: 'cash', name: 'Cash', icon: Banknote, color: 'bg-green-500' },
        { id: 'gcash', name: 'GCash', icon: Wallet, color: 'bg-blue-500' },
        { id: 'card', name: 'Card', icon: CreditCard, color: 'bg-purple-500' },
    ];

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Ticket Details', href: '#' },
        ]}>
            <Head title="Ticket Details" />
            
            <div className="max-w-2xl mx-auto p-4">
                {/* Header */}
                <div className="bg-blue-600 text-white rounded-t-2xl p-6">
                    <h1 className="text-2xl font-bold mb-1">Ticket Details</h1>
                    <p className="text-blue-100">Review and process payment</p>
                </div>

                {/* Ticket Info Card */}
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-b-2xl border border-gray-200 dark:border-gray-700">
                    <div className="p-6 space-y-6">
                        {/* Ticket ID */}
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ticket ID</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{ticket.ticket_id}</p>
                        </div>

                        {/* Plate Number */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Car className="h-6 w-6 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Plate</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{ticket.plate_number}</p>
                            </div>
                        </div>

                        {/* Entry Time */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Clock className="h-6 w-6 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Entry</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {new Date(ticket.entry_time).toLocaleTimeString('en-US', { 
                                        hour: 'numeric', 
                                        minute: '2-digit',
                                        hour12: true 
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Time Elapsed */}
                        {ticket.rate_type === 'hourly' && (
                            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <Clock className="h-6 w-6 text-blue-600" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Time Elapsed</p>
                                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                        {hours} hr {minutes} min
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Rate Type */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <MapPin className="h-6 w-6 text-orange-600" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Rate Type</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                                    {ticket.rate_type === 'flat_rate' ? 'Flat Rate' : 
                                     ticket.rate_type === 'overnight' ? 'Overnight' : 'Hourly'}
                                </p>
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Payment Method</p>
                            <div className="grid grid-cols-3 gap-3">
                                {paymentMethods.map((method) => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setSelectedMethod(method.id as any)}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                            selectedMethod === method.id
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                                        }`}
                                    >
                                        <div className={`${method.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2`}>
                                            <method.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{method.name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Amount to Pay */}
                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount to Pay</p>
                            <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                                ₱ {amount.toFixed(2)}
                            </p>
                            {ticket.rate_type === 'hourly' && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    ₱40/hour × {Math.ceil(elapsedMinutes / 60)} hour(s)
                                </p>
                            )}
                        </div>

                        {/* Pay Button */}
                        <Button
                            onClick={handlePayment}
                            disabled={processing}
                            className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
                        >
                            {processing ? 'Processing...' : 'Pay Now'}
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
