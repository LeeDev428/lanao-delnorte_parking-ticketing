import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';
import { Car, Home, Bluetooth, Printer, Loader2, Clock, MapPin } from 'lucide-react';
import { usePrinterContext } from '@/contexts/printer-context';
import { useState, useEffect, useRef } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import QRCode from 'qrcode';

interface Ticket {
    id: number;
    ticket_id: string;
    plate_number: string;
    parking_zone: string;
    rate_type: string;
    price: number;
    entry_time: string;
    status: string;
    agent: {
        name: string;
    };
}

interface EntryReceiptProps {
    ticket: Ticket;
}

export default function EntryReceipt({ ticket }: EntryReceiptProps) {
    const printer = usePrinterContext();
    const [showSuccess, setShowSuccess] = useState(false);
    const [qrCodeData, setQrCodeData] = useState<string>('');
    const printedRef = useRef(false);
    
    // Generate QR code on mount - contains ticket_id for scanning
    useEffect(() => {
        const generateQR = async () => {
            try {
                // Simple JSON with just ticket_id for reliable scanning
                const qrData = `{"ticket_id":"${ticket.ticket_id}"}`;
                const qrImage = await QRCode.toDataURL(qrData, {
                    width: 250,
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
    }, [ticket]);

    // Auto-print if printer is connected
    useEffect(() => {
        if (printer.isNative && printer.isConnected && !printedRef.current && qrCodeData) {
            printedRef.current = true;
            handleBluetoothPrint();
        }
    }, [printer.isConnected, qrCodeData]);

    const handleBluetoothConnect = () => {
        router.visit('/settings/printer');
    };

    const handleBluetoothPrint = async () => {
        try {
            // Create a receipt-like object for the printer
            const entryReceipt = {
                receipt_number: `ENTRY-${ticket.ticket_id}`,
                amount: 0, // No payment yet
                payment_method: 'PENDING',
                paid_at: ticket.entry_time,
                ticket: {
                    ticket_id: ticket.ticket_id,
                    plate_number: ticket.plate_number,
                    parking_zone: ticket.parking_zone,
                    entry_time: ticket.entry_time,
                    exit_time: null,
                    rate_type: ticket.rate_type,
                },
                collector: {
                    name: ticket.agent?.name || 'Agent',
                },
            };
            await printer.print(entryReceipt);
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
            { title: 'Entry Receipt', href: '#' },
        ]}>
            <Head title="Entry Receipt" />
            
            <div className="w-full px-3 sm:px-6 py-6 bg-gray-100 dark:bg-gray-900 min-h-screen print:bg-white print:p-0">
                {/* Success Header - Hide on print */}
                <div className="bg-blue-600 text-white rounded-t-2xl p-6 text-center mb-6 print:hidden">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-3">
                        <Car className="h-10 w-10 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold mb-1">Ticket Generated</h1>
                    <p className="text-blue-100">Vehicle can now park - Pay on exit</p>
                </div>

                {/* Entry Receipt Card - Thermal Printer Style */}
                <div className="max-w-md mx-auto bg-white shadow-2xl print:shadow-none print:max-w-full">
                    {/* Receipt Header */}
                    <div className="text-center p-6 border-b-2 border-dashed border-gray-300">
                        <h2 className="text-xl font-bold mb-1">PARKING ENTRY TICKET</h2>
                        <p className="text-sm text-gray-600">Lanao del Norte</p>
                        <p className="text-xs text-gray-500 mt-2">HOURLY RATE - Pay on Exit</p>
                    </div>

                    {/* Receipt Body */}
                    <div className="p-6 space-y-3 text-sm">
                        {/* Ticket ID */}
                        <div className="text-center py-4 bg-blue-50 rounded-lg mb-4">
                            <p className="text-xs text-gray-500 mb-1">Ticket No.</p>
                            <p className="text-2xl font-bold text-blue-600">{ticket.ticket_id}</p>
                        </div>

                        {/* QR Code - IMPORTANT for scanning on exit */}
                        <div className="flex justify-center py-4">
                            <div className="bg-white p-3 border-2 border-blue-500 rounded">
                                {qrCodeData ? (
                                    <img src={qrCodeData} alt="Entry QR Code" className="w-40 h-40" />
                                ) : (
                                    <div className="w-40 h-40 flex items-center justify-center bg-gray-100">
                                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-center text-sm font-semibold text-blue-600 mb-4">
                            🔷 SCAN THIS QR CODE WHEN EXITING 🔷
                        </p>

                        <div className="border-t border-dashed border-gray-300 pt-3"></div>

                        {/* Details */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Plate Number:</span>
                                <span className="font-bold">{ticket.plate_number || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Parking Zone:</span>
                                <span className="font-bold">{ticket.parking_zone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Entry Time:</span>
                                <span className="font-semibold text-xs">
                                    {new Date(ticket.entry_time).toLocaleString('en-US', {
                                        month: '2-digit', day: '2-digit', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit', hour12: true
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Rate Type:</span>
                                <span className="font-bold text-blue-600">HOURLY</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Rate:</span>
                                <span className="font-bold">₱{Number(ticket.price).toFixed(2)}/hour</span>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-300 my-4"></div>

                        {/* Status */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                            <p className="text-xs text-yellow-700 mb-1">STATUS</p>
                            <p className="text-xl font-bold text-yellow-600">ACTIVE - UNPAID</p>
                            <p className="text-xs text-yellow-600 mt-2">
                                Present this ticket when exiting for payment calculation
                            </p>
                        </div>

                        <div className="border-t border-dashed border-gray-300 my-4"></div>

                        {/* Footer */}
                        <div className="text-center text-xs text-gray-500 space-y-1">
                            <p>Issued by: {ticket.agent?.name || 'Agent'}</p>
                            <p>{new Date(ticket.entry_time).toLocaleString()}</p>
                            <p className="pt-3 font-semibold">Keep this ticket safe!</p>
                            <p>Required for exit and payment</p>
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
                                    <Printer className="h-4 w-4" />
                                    <AlertDescription>
                                        {printer.isPrinting ? 'Printing...' : 'Printed Successfully!'}
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
                                                    Print Entry Ticket
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Browser Print Button */}
                    <Button
                        onClick={handlePrint}
                        variant="outline"
                        className="w-full h-12"
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        Print (Browser)
                    </Button>

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
