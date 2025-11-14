import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { Check, Download, Share2, Home, Bluetooth, Printer, Loader2 } from 'lucide-react';
import { usePrinter } from '@/hooks/use-printer';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Payment {
    id: number;
    receipt_number: string;
    amount: number;
    payment_method: string;
    paid_at: string;
    ticket: {
        ticket_id: string;
        plate_number: string;
        parking_zone: string;
        entry_time: string;
        exit_time: string;
        rate_type: string;
    };
    collector: {
        name: string;
    };
}

interface ReceiptProps {
    payment: Payment;
}

export default function Receipt({ payment }: ReceiptProps) {
    // Ensure amount is a number
    const amount = Number(payment.amount) || 0;
    
    // Bluetooth printer hook
    const printer = usePrinter();
    const [showSuccess, setShowSuccess] = useState(false);
    
    // Generate simple QR code data URL (placeholder)
    const qrCodeData = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23000'/%3E%3Crect x='10' y='10' width='30' height='30' fill='%23fff'/%3E%3Crect x='50' y='10' width='30' height='30' fill='%23fff'/%3E%3Crect x='90' y='10' width='30' height='30' fill='%23fff'/%3E%3Crect x='130' y='10' width='30' height='30' fill='%23fff'/%3E%3Crect x='170' y='10' width='20' height='30' fill='%23fff'/%3E%3C/svg%3E`;

    const handlePrint = () => {
        window.print();
    };

    const handleBluetoothConnect = async () => {
        try {
            await printer.connect();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Connection error:', error);
        }
    };

    const handleBluetoothPrint = async () => {
        try {
            await printer.print(payment);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Print error:', error);
        }
    };

    const handleTestPrint = async () => {
        try {
            await printer.testPrint();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Test print error:', error);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Receipt', href: '#' },
        ]}>
            <Head title="Payment Success" />
            
            <div className="max-w-2xl mx-auto p-4">
                {/* Success Header */}
                <div className="bg-green-600 text-white rounded-t-2xl p-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
                        <Check className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Payment Received</h1>
                    <p className="text-green-100 text-lg">Transaction completed successfully</p>
                </div>

                {/* Receipt Card */}
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-b-2xl border border-gray-200 dark:border-gray-700">
                    <div className="p-8 space-y-6">
                        {/* Receipt Number */}
                        <div className="text-center pb-6 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Receipt No:</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{payment.receipt_number}</p>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center py-4">
                            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                                <img 
                                    src={qrCodeData} 
                                    alt="Receipt QR Code" 
                                    className="w-40 h-40"
                                />
                            </div>
                        </div>

                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            Show to Attendant upon exit
                        </p>

                        {/* Payment Details */}
                        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Ticket ID</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{payment.ticket.ticket_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Plate Number</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{payment.ticket.plate_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Parking Zone</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{payment.ticket.parking_zone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Entry Time</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {new Date(payment.ticket.entry_time).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Exit Time</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {new Date(payment.ticket.exit_time).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Rate Type</span>
                                <span className="font-semibold text-gray-900 dark:text-white capitalize">
                                    {payment.ticket.rate_type.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                                <span className="font-semibold text-gray-900 dark:text-white uppercase">
                                    {payment.payment_method}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Collected By</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{payment.collector.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Date & Time</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {new Date(payment.paid_at).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Total Amount */}
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Amount</span>
                                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    ₱ {amount.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {printer.isNative && (
                            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                {/* Error Message */}
                                {printer.error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{printer.error}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Success Message */}
                                {showSuccess && (
                                    <Alert className="bg-green-50 border-green-200 text-green-800">
                                        <Check className="h-4 w-4" />
                                        <AlertDescription>
                                            {printer.isPrinting ? 'Printing...' : 'Operation successful!'}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Bluetooth Printer Section */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Bluetooth className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                Bluetooth Printer
                                            </span>
                                        </div>
                                        {printer.isConnected && (
                                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                                                Connected: {printer.deviceName}
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {!printer.isConnected ? (
                                            <Button
                                                onClick={handleBluetoothConnect}
                                                disabled={printer.isConnecting}
                                                className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                {printer.isConnecting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Connecting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Bluetooth className="h-4 w-4 mr-2" />
                                                        Connect to PT-210
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    onClick={handleBluetoothPrint}
                                                    disabled={printer.isPrinting}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    {printer.isPrinting ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Printing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Printer className="h-4 w-4 mr-2" />
                                                            Print Receipt
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={handleTestPrint}
                                                    disabled={printer.isPrinting}
                                                    variant="outline"
                                                >
                                                    Test Print
                                                </Button>
                                                <Button
                                                    onClick={printer.disconnect}
                                                    variant="outline"
                                                    className="col-span-2"
                                                >
                                                    Disconnect
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Standard Print/Share Buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-4">
                            <Button
                                onClick={handlePrint}
                                variant="outline"
                                className="h-12"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Print
                            </Button>
                            <Button
                                variant="outline"
                                className="h-12"
                            >
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </div>

                        <Link href="/dashboard">
                            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white">
                                <Home className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
