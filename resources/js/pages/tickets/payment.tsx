import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';
import { Clock, MapPin, Car, CreditCard, Wallet, Banknote, ArrowLeft, CheckCircle, Printer, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { usePrinterContext } from '@/contexts/printer-context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const printer = usePrinterContext();

    // Calculate time elapsed
    const entryTime = new Date(ticket.entry_time);
    const now = new Date();
    const elapsedMinutes = Math.floor((now.getTime() - entryTime.getTime()) / (1000 * 60));
    const hours = Math.floor(elapsedMinutes / 60);
    const minutes = elapsedMinutes % 60;

    // Calculate amount for hourly
    let amount = Number(ticket.price) || 0;
    if (ticket.rate_type === 'hourly') {
        const chargeableHours = Math.ceil(elapsedMinutes / 60) || 1;
        amount = chargeableHours * 40; // ₱40 per hour
    }

    const handlePayment = () => {
        setShowConfirmModal(true);
    };

    const confirmPayment = () => {
        setProcessing(true);
        setShowConfirmModal(false);
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
            
            <div className="w-full px-3 sm:px-6 py-3 sm:py-4">
                {/* Printer Status Alert */}
                {printer.isNative && !printer.isConnected && (
                    <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                            Printer not connected. Please connect in{' '}
                            <button
                                onClick={() => router.visit('/settings/printer')}
                                className="font-semibold underline"
                            >
                                Printer Settings
                            </button>
                            {' '}before processing payment.
                        </AlertDescription>
                    </Alert>
                )}

                {printer.isNative && printer.isConnected && (
                    <Alert className="mb-4 bg-green-50 border-green-200">
                        <Printer className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            ✓ Printer connected: {printer.deviceName} - Receipt will print automatically
                        </AlertDescription>
                    </Alert>
                )}

                {/* Header */}
                <div className="bg-blue-600 text-white rounded-t-2xl p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                // Go back to dashboard instead of create page
                                router.visit('/dashboard');
                            }}
                            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold mb-1">Ticket Details</h1>
                            <p className="text-sm sm:text-base text-blue-100">Review and process payment</p>
                        </div>
                    </div>
                </div>

                {/* Ticket Info Card */}
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-b-2xl border border-gray-200 dark:border-gray-700">
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        {/* Ticket ID */}
                        <div>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Ticket ID</p>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white break-all">{ticket.ticket_id}</p>
                        </div>

                        {/* Plate Number */}
                        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Car className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Plate</p>
                                <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">{ticket.plate_number}</p>
                            </div>
                        </div>

                        {/* Entry Time */}
                        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Entry</p>
                                <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">
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
                            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Time Elapsed</p>
                                    <p className="text-base sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                                        {hours} hr {minutes} min
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Rate Type */}
                        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Rate Type</p>
                                <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white capitalize">
                                    {ticket.rate_type === 'flat_rate' ? 'Flat Rate' : 
                                     ticket.rate_type === 'overnight' ? 'Overnight' : 'Hourly'}
                                </p>
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div>
                            <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Payment Method</p>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                {paymentMethods.map((method) => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setSelectedMethod(method.id as any)}
                                        className={`p-2 sm:p-4 rounded-lg border-2 transition-all ${
                                            selectedMethod === method.id
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                                        }`}
                                    >
                                        <div className={`${method.color} w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2`}>
                                            <method.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                        </div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{method.name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Amount to Pay */}
                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 sm:p-6 border-2 border-green-200 dark:border-green-800">
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Amount to Pay</p>
                            <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-600 dark:text-green-400 break-words">
                                ₱{amount.toFixed(2)}
                            </p>
                            {ticket.rate_type === 'hourly' && (
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    ₱40/hour × {Math.ceil(elapsedMinutes / 60)} hour(s)
                                </p>
                            )}
                        </div>

                        {/* Pay Button */}
                        <Button
                            onClick={handlePayment}
                            disabled={processing}
                            className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
                        >
                            {processing ? 'Processing...' : 'Pay Now'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <DialogTitle className="text-xl">Confirm Payment</DialogTitle>
                        </div>
                        <DialogDescription className="text-base pt-2">
                            Are you sure you want to process this payment?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Ticket ID:</span>
                            <span className="font-semibold">{ticket.ticket_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Plate:</span>
                            <span className="font-semibold">{ticket.plate_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                            <span className="font-semibold capitalize">{selectedMethod}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                            <span className="text-xl font-bold text-green-600 dark:text-green-400">₱{amount.toFixed(2)}</span>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowConfirmModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmPayment}
                            disabled={processing}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            Confirm Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
