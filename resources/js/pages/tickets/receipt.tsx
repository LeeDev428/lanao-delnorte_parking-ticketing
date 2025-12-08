import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Check, Home, Bluetooth, Printer, Loader2 } from 'lucide-react';
import { usePrinterContext } from '@/contexts/printer-context';
import { useState, useEffect, useRef } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import QRCode from 'qrcode';

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
    const { systemSettings } = usePage<SharedData>().props;
    const amount = Number(payment.amount) || 0;
    const printer = usePrinterContext();
    const [showSuccess, setShowSuccess] = useState(false);
    const [qrCodeData, setQrCodeData] = useState<string>('');
    const printedRef = useRef(false);
    
    // Generate QR code on mount
    useEffect(() => {
        const generateQR = async () => {
            try {
                const qrData = JSON.stringify({
                    receipt: payment.receipt_number,
                    ticket: payment.ticket.ticket_id,
                    amount: payment.amount,
                    date: payment.paid_at
                });
                const qrImage = await QRCode.toDataURL(qrData, {
                    width: 200,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                setQrCodeData(qrImage);
            } catch (error) {
                console.error('Failed to generate QR code:', error);
            }
        };
        generateQR();
    }, [payment]);

    // Auto-print if printer is connected (from global context)
    useEffect(() => {
        if (printer.isNative && printer.isConnected && !printedRef.current) {
            printedRef.current = true;
            handleBluetoothPrint();
        }
    }, [printer.isConnected]);

    const handleBluetoothConnect = () => {
        router.visit('/settings/printer');
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

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Receipt', href: '#' },
        ]}>
            <Head title="Payment Success" />
            
            <div className="w-full px-3 sm:px-6 py-6 bg-gray-100 min-h-screen print:bg-white print:p-0">
                {/* Success Header - Hide on print */}
                <div className="bg-green-600 text-white rounded-t-2xl p-6 text-center mb-6 print:hidden">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-3">
                        <Check className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold mb-1">Payment Received</h1>
                    <p className="text-green-100">Transaction completed successfully</p>
                </div>

                {/* Receipt Card - Thermal Printer Style */}
                <div className="max-w-md mx-auto bg-white shadow-2xl print:shadow-none print:max-w-full">
                    {/* Receipt Header */}
                    <div className="text-center p-6 border-b-2 border-dashed border-gray-300">
                        <h2 className="text-xl font-bold mb-1">PARKING RECEIPT</h2>
                        <p className="text-sm text-gray-600">{systemSettings.shortName}</p>
                        <p className="text-xs text-gray-500 mt-2">Thank you for parking with us</p>
                    </div>

                    {/* Receipt Body */}
                    <div className="p-6 space-y-3 text-sm">
                        {/* Receipt Number */}
                        <div className="text-center py-4 bg-gray-50 rounded-lg mb-4">
                            <p className="text-xs text-gray-500 mb-1">Receipt No.</p>
                            <p className="text-2xl font-bold">{payment.receipt_number}</p>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center py-4">
                            <div className="bg-white p-3 border-2 border-gray-300 rounded">
                                {qrCodeData ? (
                                    <img src={qrCodeData} alt="Receipt QR Code" className="w-32 h-32" />
                                ) : (
                                    <div className="w-32 h-32 flex items-center justify-center bg-gray-100">
                                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-center text-xs text-gray-500 mb-4">
                            Show to Attendant upon exit
                        </p>

                        <div className="border-t border-dashed border-gray-300 pt-3"></div>

                        {/* Details */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Ticket ID:</span>
                                <span className="font-bold">{payment.ticket.ticket_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Plate Number:</span>
                                <span className="font-bold">{payment.ticket.plate_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Parking Zone:</span>
                                <span className="font-bold">{payment.ticket.parking_zone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Entry Time:</span>
                                <span className="font-semibold text-xs">
                                    {new Date(payment.ticket.entry_time).toLocaleString('en-US', {
                                        month: '2-digit', day: '2-digit', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit', hour12: true
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Exit Time:</span>
                                <span className="font-semibold text-xs">
                                    {new Date(payment.ticket.exit_time).toLocaleString('en-US', {
                                        month: '2-digit', day: '2-digit', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit', hour12: true
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Rate Type:</span>
                                <span className="font-bold capitalize">
                                    {payment.ticket.rate_type === 'flat_rate' ? 'Flat Rate' :
                                     payment.ticket.rate_type === 'overnight' ? 'Overnight' : 'Hourly'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Method:</span>
                                <span className="font-bold uppercase">{payment.payment_method}</span>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-300 my-4"></div>

                        {/* Amount */}
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-xs text-gray-500 mb-1">TOTAL AMOUNT</p>
                            <p className="text-4xl font-bold text-green-600">₱{amount.toFixed(2)}</p>
                        </div>

                        <div className="border-t border-dashed border-gray-300 my-4"></div>

                        {/* Footer */}
                        <div className="text-center text-xs text-gray-500 space-y-1">
                            <p>Collected by: {payment.collector.name}</p>
                            <p>{new Date(payment.paid_at).toLocaleString()}</p>
                            <p className="pt-3">This is an official receipt</p>
                            <p>Please keep for your records</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Hide on print */}
                <div className="max-w-md mx-auto mt-6 space-y-3 print:hidden">
                    {/* Bluetooth Status */}
                    {printer.isNative && (
                        <>
                            {printer.error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{printer.error}</AlertDescription>
                                </Alert>
                            )}

                            {showSuccess && (
                                <Alert className="bg-green-50 border-green-200 text-green-800">
                                    <Check className="h-4 w-4" />
                                    <AlertDescription>
                                        {printer.isPrinting ? 'Printing...' : 'Success!'}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Bluetooth className="h-5 w-5 text-blue-600" />
                                        <span className="font-semibold">Thermal Printer</span>
                                    </div>
                                    {printer.isConnected && (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                            Connected: {printer.deviceName}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {!printer.isConnected ? (
                                        <Button
                                            onClick={handleBluetoothConnect}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Bluetooth className="h-4 w-4 mr-2" />
                                            Go to Printer Settings
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                onClick={handleBluetoothPrint}
                                                disabled={printer.isPrinting}
                                                className="w-full bg-green-600 hover:bg-green-700"
                                            >
                                                {printer.isPrinting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Printing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Printer className="h-4 w-4 mr-2" />
                                                        Print Receipt Again
                                                    </>
                                                )}
                                            </Button>
                                        </>
                                    )}
                                </div>
                                
                                {printer.isConnected && (
                                    <p className="text-xs text-center text-blue-600 mt-2">
                                        ✓ Printer will stay connected for next transaction
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    <Button
                        onClick={() => router.visit('/dashboard')}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                    >
                        <Home className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
