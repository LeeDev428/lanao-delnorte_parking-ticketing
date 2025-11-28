import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Clock, Car, MapPin, CreditCard, XCircle, CheckCircle, ChevronLeft, ChevronRight, Filter, Search, X, Camera, QrCode, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';

interface Ticket {
    id: number;
    ticket_id: string;
    plate_number: string;
    parking_zone: string;
    rate_type: 'hourly' | 'flat_rate' | 'overnight';
    price: number;
    entry_time: string;
    status: string;
    duration_minutes?: number;
}

interface ActiveTicketsProps {
    tickets: {
        data: Ticket[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        from: number;
        to: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    parkingZones: string[];
    filters: {
        zone?: string;
        rate_type?: string;
        search?: string;
    };
}

export default function ActiveTickets({ tickets, parkingZones, filters }: ActiveTicketsProps) {
    const [showSuccess, setShowSuccess] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRateType, setSelectedRateType] = useState(filters.rate_type || 'all');
    const [showFilters, setShowFilters] = useState(false);
    const { props } = usePage();
    const successMessage = props.success as string | undefined;

    // QR Scanner states
    const [showScanner, setShowScanner] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);

    // Modal for already paid/inactive ticket
    const [showPaidModal, setShowPaidModal] = useState(false);
    const [scannedTicket, setScannedTicket] = useState<any>(null);

    const applyFilters = () => {
        router.get('/tickets', {
            search: searchTerm || undefined,
            rate_type: selectedRateType !== 'all' ? selectedRateType : undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedRateType('all');
        router.get('/tickets', {}, { preserveState: true });
    };

    // Start QR Scanner
    const startScanner = async () => {
        setScanError(null);
        setShowScanner(true);
        setScanning(true);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                scanQRCode();
            }
        } catch (error) {
            console.error('Camera access error:', error);
            setScanError('Unable to access camera. Please ensure camera permissions are granted.');
            setScanning(false);
        }
    };

    // Stop QR Scanner
    const stopScanner = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        setShowScanner(false);
        setScanning(false);
    };

    // Scan QR Code from video frame
    const scanQRCode = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                handleQRCodeScanned(code.data);
                return;
            }
        }

        animationRef.current = requestAnimationFrame(scanQRCode);
    };

    // Handle scanned QR code
    const handleQRCodeScanned = async (qrData: string) => {
        stopScanner();

        try {
            const parsed = JSON.parse(qrData);
            const ticketId = parsed.ticket_id;

            if (!ticketId) {
                setScanError('Invalid QR code format');
                return;
            }

            // Call API to get ticket status
            const response = await fetch('/tickets/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ ticket_id: ticketId }),
            });

            const data = await response.json();

            if (!data.success) {
                setScanError(data.message || 'Ticket not found');
                return;
            }

            const ticket = data.ticket;

            // Check if ticket is active
            if (ticket.status === 'active') {
                // Redirect to payment page
                router.visit(`/tickets/${ticket.id}/payment`);
            } else {
                // Show modal for already paid/inactive ticket
                setScannedTicket({
                    ...ticket,
                    payment: data.payment,
                });
                setShowPaidModal(true);
            }
        } catch (error) {
            console.error('QR parse error:', error);
            setScanError('Invalid QR code. Please scan a valid parking ticket.');
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    useEffect(() => {
        if (successMessage) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const calculateElapsedTime = (entryTime: string) => {
        const entry = new Date(entryTime);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - entry.getTime()) / (1000 * 60));
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        return `${hours}h ${minutes}m`;
    };

    const calculateCurrentCharge = (ticket: Ticket): number => {
        if (ticket.rate_type === 'hourly') {
            const entry = new Date(ticket.entry_time);
            const now = new Date();
            const diffMinutes = Math.floor((now.getTime() - entry.getTime()) / (1000 * 60));
            const chargeableHours = Math.ceil(diffMinutes / 60) || 1;
            return chargeableHours * 40; // ₱40 per hour
        }
        return Number(ticket.price) || 0;
    };

    const handleDeactivate = (ticketId: number) => {
        if (confirm('Are you sure you want to deactivate this ticket? This will mark it as completed without payment.')) {
            router.post(`/tickets/${ticketId}/deactivate`);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Active Tickets', href: '/tickets' },
        ]}>
            <Head title="Active Tickets" />
            
            <div className="w-full px-3 sm:px-6 py-4 sm:py-6">
                {/* Success Message */}
                {showSuccess && successMessage && (
                    <div className="mb-6 bg-green-500 text-white rounded-lg p-4 flex items-center gap-3 animate-in slide-in-from-top">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{successMessage}</span>
                    </div>
                )}

                {/* Header */}
                <div className="bg-blue-600 text-white rounded-t-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Active Tickets</h1>
                            <p className="text-blue-100">Currently parked vehicles</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Scan QR Button */}
                            <Button
                                onClick={startScanner}
                                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold"
                            >
                                <QrCode className="h-5 w-5 mr-2" />
                                Scan QR
                            </Button>
                            <div className="bg-white/20 px-4 py-2 rounded-lg">
                                <p className="text-3xl font-bold">{tickets?.total || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Filters</h2>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                            {showFilters ? 'Hide' : 'Show'}
                        </Button>
                    </div>
                    
                    {showFilters && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <Label htmlFor="search" className="text-xs">Plate Number</Label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="search"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 h-9"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="rate_type" className="text-xs">Rate Type</Label>
                                <Select value={selectedRateType} onValueChange={setSelectedRateType}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="hourly">Hourly</SelectItem>
                                        <SelectItem value="flat_rate">Flat Rate</SelectItem>
                                        <SelectItem value="overnight">Overnight</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end gap-2">
                                <Button onClick={applyFilters} className="flex-1 h-9">
                                    Apply
                                </Button>
                                <Button onClick={clearFilters} variant="outline" size="icon" className="h-9 w-9">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tickets Table */}
                <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    {!tickets?.data || tickets.data.length === 0 ? (
                        <div className="text-center py-12">
                            <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No active tickets</p>
                            <Link href="/tickets/create">
                                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                                    Create New Ticket
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Horizontal Scrollable Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-max">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                Ticket ID
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                Plate Number
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                Parking Zone
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                Rate Type
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                Elapsed Time
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                Current Charge
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                Entry Time
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {tickets.data.map((ticket) => {
                                            const currentCharge = calculateCurrentCharge(ticket);
                                            
                                            return (
                                                <tr 
                                                    key={ticket.id}
                                                    className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                                                >
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                            <Car className="h-3 w-3" /> Active
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {ticket.ticket_id}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                                                            {ticket.plate_number || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {ticket.parking_zone}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${
                                                            ticket.rate_type === 'hourly' 
                                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                : ticket.rate_type === 'flat_rate'
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                        }`}>
                                                            {ticket.rate_type.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {calculateElapsedTime(ticket.entry_time)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div>
                                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                                ₱{currentCharge.toFixed(2)}
                                                            </span>
                                                            {ticket.rate_type === 'hourly' && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    ₱40/hr
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {new Date(ticket.entry_time).toLocaleString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex gap-2">
                                                            {ticket.rate_type === 'hourly' && (
                                                                <Link href={`/tickets/${ticket.id}/payment`}>
                                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8">
                                                                        <CreditCard className="h-3 w-3 mr-1" />
                                                                        Pay
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            <Button 
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleDeactivate(ticket.id)}
                                                                className="bg-red-600 hover:bg-red-700 h-8"
                                                            >
                                                                <XCircle className="h-3 w-3 mr-1" />
                                                                End
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                        {/* Pagination */}
                        {tickets.last_page > 1 && (
                            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing {tickets.from} to {tickets.to} of {tickets.total} results
                                </div>
                                <div className="flex gap-2">
                                    {tickets.links.map((link, index) => {
                                        if (!link.url) {
                                            return (
                                                <Button
                                                    key={index}
                                                    disabled
                                                    variant="outline"
                                                    size="sm"
                                                    className="min-w-[40px]"
                                                >
                                                    {index === 0 ? <ChevronLeft className="h-4 w-4" /> : 
                                                     index === tickets.links.length - 1 ? <ChevronRight className="h-4 w-4" /> :
                                                     link.label}
                                                </Button>
                                            );
                                        }

                                        return (
                                            <Link key={index} href={link.url}>
                                                <Button
                                                    variant={link.active ? "default" : "outline"}
                                                    size="sm"
                                                    className={`min-w-[40px] ${link.active ? 'bg-blue-600' : ''}`}
                                                >
                                                    {index === 0 ? <ChevronLeft className="h-4 w-4" /> : 
                                                     index === tickets.links.length - 1 ? <ChevronRight className="h-4 w-4" /> :
                                                     link.label}
                                                </Button>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                    )}
                </div>
            </div>

            {/* QR Scanner Modal */}
            <Dialog open={showScanner} onOpenChange={(open) => !open && stopScanner()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            Scan Parking Ticket QR
                        </DialogTitle>
                        <DialogDescription>
                            Point your camera at the QR code on the parking ticket
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="relative">
                        {scanError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {scanError}
                            </div>
                        )}
                        
                        <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                playsInline
                                muted
                            />
                            <canvas ref={canvasRef} className="hidden" />
                            
                            {/* Scan overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-48 h-48 border-2 border-yellow-400 rounded-lg">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-400 rounded-tl-lg"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow-400 rounded-tr-lg"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow-400 rounded-bl-lg"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-400 rounded-br-lg"></div>
                                </div>
                            </div>
                            
                            {scanning && (
                                <div className="absolute bottom-4 left-0 right-0 text-center">
                                    <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                                        Scanning...
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={stopScanner} className="w-full">
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Already Paid/Inactive Ticket Modal */}
            <Dialog open={showPaidModal} onOpenChange={setShowPaidModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
                                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <DialogTitle className="text-xl">Ticket Already Processed</DialogTitle>
                        </div>
                        <DialogDescription>
                            This ticket is no longer active. It has already been paid or cancelled.
                        </DialogDescription>
                    </DialogHeader>

                    {scannedTicket && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Ticket ID:</span>
                                <span className="font-semibold">{scannedTicket.ticket_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Plate:</span>
                                <span className="font-semibold">{scannedTicket.plate_number || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                <span className={`font-semibold uppercase ${
                                    scannedTicket.status === 'paid' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {scannedTicket.status}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Entry Time:</span>
                                <span className="font-semibold text-xs">
                                    {new Date(scannedTicket.entry_time).toLocaleString()}
                                </span>
                            </div>
                            {scannedTicket.exit_time && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Exit Time:</span>
                                    <span className="font-semibold text-xs">
                                        {new Date(scannedTicket.exit_time).toLocaleString()}
                                    </span>
                                </div>
                            )}
                            {scannedTicket.payment && (
                                <>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Receipt #:</span>
                                            <span className="font-semibold">{scannedTicket.payment.receipt_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                                            <span className="font-bold text-green-600">
                                                ₱{Number(scannedTicket.payment.amount).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                                            <span className="font-semibold uppercase">{scannedTicket.payment.payment_method}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Paid At:</span>
                                            <span className="font-semibold text-xs">
                                                {new Date(scannedTicket.payment.paid_at).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setShowPaidModal(false)} className="w-full">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}