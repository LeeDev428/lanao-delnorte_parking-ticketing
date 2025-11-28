import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Filter, Search, X, Calendar, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import QRCode from 'qrcode';

interface Ticket {
    id: number;
    ticket_id: string;
    plate_number: string;
    parking_zone: string;
    rate_type: string;
    price: number;
    entry_time: string;
    exit_time: string;
    status: 'paid' | 'cancelled';
    agent?: {
        name: string;
    };
    payment?: {
        amount: number;
        payment_method: string;
        paid_at: string;
        receipt_number: string;
        collector?: {
            name: string;
        };
    };
}

interface HistoryProps {
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
        status?: string;
        zone?: string;
        rate_type?: string;
        search?: string;
        start_date?: string;
        end_date?: string;
        per_page?: number;
    };
}

export default function History({ tickets, parkingZones, filters }: HistoryProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedRateType, setSelectedRateType] = useState(filters.rate_type || 'all');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [perPage, setPerPage] = useState(filters.per_page || 20);
    const [showFilters, setShowFilters] = useState(false);
    
    // Receipt modal state
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [qrCodeData, setQrCodeData] = useState<string>('');

    // Generate QR code when ticket is selected
    useEffect(() => {
        const generateQR = async () => {
            if (selectedTicket?.payment) {
                try {
                    const qrData = JSON.stringify({
                        receipt: selectedTicket.payment.receipt_number,
                        ticket: selectedTicket.ticket_id,
                        amount: selectedTicket.payment.amount,
                        date: selectedTicket.payment.paid_at
                    });
                    const qrImage = await QRCode.toDataURL(qrData, {
                        width: 200,
                        margin: 1,
                        color: { dark: '#000000', light: '#FFFFFF' }
                    });
                    setQrCodeData(qrImage);
                } catch (error) {
                    console.error('Failed to generate QR code:', error);
                }
            }
        };
        if (selectedTicket) generateQR();
    }, [selectedTicket]);

    const openReceiptModal = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setShowReceiptModal(true);
    };

    const applyFilters = () => {
        router.get('/tickets/history', {
            search: searchTerm || undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            rate_type: selectedRateType !== 'all' ? selectedRateType : undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            per_page: perPage,
        }, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedRateType('all');
        setStartDate('');
        setEndDate('');
        setPerPage(20);
        router.get('/tickets/history', {}, { preserveState: true });
    };

    const goToPage = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    const calculateDuration = (entryTime: string, exitTime: string) => {
        const entry = new Date(entryTime);
        const exit = new Date(exitTime);
        const diffMinutes = Math.floor((exit.getTime() - entry.getTime()) / (1000 * 60));
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        return `${hours}h ${minutes}m`;
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'History', href: '/tickets/history' },
        ]}>
            <Head title="Ticket History" />
            
            <div className="w-full px-3 sm:px-6 py-4 sm:py-6">
                {/* Header */}
                <div className="bg-blue-600 text-white rounded-t-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Ticket History</h1>
                            <p className="text-blue-100">Completed and cancelled tickets</p>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <p className="text-3xl font-bold">{tickets?.total || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-gray-600" />
                            <h2 className="text-base font-semibold text-gray-900">Filters</h2>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                            {showFilters ? 'Hide' : 'Show'}
                        </Button>
                    </div>
                    
                    {showFilters && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                                    <Label htmlFor="status" className="text-xs">Status</Label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <Label htmlFor="start_date" className="text-xs">Start Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="pl-8 h-9"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="end_date" className="text-xs">End Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="pl-8 h-9"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="per_page" className="text-xs">Per Page</Label>
                                    <Select value={String(perPage)} onValueChange={(val) => setPerPage(Number(val))}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="20">20</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button onClick={applyFilters} className="flex-1 h-9">
                                    Apply Filters
                                </Button>
                                <Button onClick={clearFilters} variant="outline" className="h-9">
                                    <X className="h-4 w-4 mr-2" />
                                    Clear
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* History Table */}
                <div className="bg-white rounded-b-2xl shadow-xl border border-gray-200">
                    {!tickets?.data || tickets.data.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No ticket history</p>
                        </div>
                    ) : (
                        <>
                            {/* Horizontal Scrollable Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-max">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Ticket ID
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Plate Number
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Parking Zone
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Rate Type
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Duration
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Amount
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Payment Method
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Receipt #
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Date & Time
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Ticket
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {tickets.data.map((ticket) => {
                                            const amount = ticket.payment 
                                                ? Number(ticket.payment.amount) || 0 
                                                : Number(ticket.price) || 0;
                                            
                                            return (
                                                <tr 
                                                    key={ticket.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                                            ticket.status === 'paid'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}>
                                                            {ticket.status === 'paid' ? (
                                                                <><CheckCircle className="h-3 w-3" /> Paid</>
                                                            ) : (
                                                                <><XCircle className="h-3 w-3" /> Cancelled</>
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {ticket.ticket_id}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-sm text-gray-900 font-medium">
                                                            {ticket.plate_number || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600">
                                                            {ticket.parking_zone}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${
                                                            ticket.rate_type === 'hourly' 
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : ticket.rate_type === 'flat_rate'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-purple-100 text-purple-700'
                                                        }`}>
                                                            {ticket.rate_type.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600">
                                                            {calculateDuration(ticket.entry_time, ticket.exit_time)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-sm font-bold text-gray-900">
                                                            ₱{amount.toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600 capitalize">
                                                            {ticket.payment?.payment_method || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600">
                                                            {ticket.payment?.receipt_number || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600">
                                                            {new Date(ticket.payment?.paid_at || ticket.exit_time).toLocaleString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {ticket.status === 'paid' && ticket.payment && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => openReceiptModal(ticket)}
                                                                className="h-8"
                                                            >
                                                                <Eye className="h-3 w-3 mr-1" />
                                                                View
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {tickets.last_page > 1 && (
                                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                    <div className="text-sm text-gray-600">
                                        Showing {tickets.from} to {tickets.to} of {tickets.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => goToPage(tickets.links[0].url)}
                                            disabled={!tickets.links[0].url}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        
                                        {tickets.links.slice(1, -1).map((link, index) => (
                                            <Button
                                                key={index}
                                                onClick={() => goToPage(link.url)}
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                className={`min-w-[40px] ${link.active ? 'bg-blue-600' : ''}`}
                                            >
                                                {link.label}
                                            </Button>
                                        ))}

                                        <Button
                                            onClick={() => goToPage(tickets.links[tickets.links.length - 1].url)}
                                            disabled={!tickets.links[tickets.links.length - 1].url}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Receipt Modal */}
            <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-center">Parking Receipt</DialogTitle>
                    </DialogHeader>
                    
                    {selectedTicket && selectedTicket.payment && (
                        <div className="bg-white">
                            {/* Receipt Header */}
                            <div className="text-center pb-4 border-b-2 border-dashed border-gray-300">
                                <h2 className="text-xl font-bold mb-1">PARKING RECEIPT</h2>
                                <p className="text-sm text-gray-600">Lanao del Norte</p>
                                <p className="text-xs text-gray-500 mt-2">Thank you for parking with us</p>
                            </div>

                            {/* Receipt Body */}
                            <div className="py-4 space-y-3 text-sm">
                                {/* Receipt Number */}
                                <div className="text-center py-4 bg-gray-50 rounded-lg mb-4">
                                    <p className="text-xs text-gray-500 mb-1">Receipt No.</p>
                                    <p className="text-2xl font-bold">{selectedTicket.payment.receipt_number}</p>
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

                                <div className="border-t border-dashed border-gray-300 pt-3"></div>

                                {/* Details */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ticket ID:</span>
                                        <span className="font-bold">{selectedTicket.ticket_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Plate Number:</span>
                                        <span className="font-bold">{selectedTicket.plate_number || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Parking Zone:</span>
                                        <span className="font-bold">{selectedTicket.parking_zone}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Entry Time:</span>
                                        <span className="font-semibold text-xs">
                                            {new Date(selectedTicket.entry_time).toLocaleString('en-US', {
                                                month: '2-digit', day: '2-digit', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit', hour12: true
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Exit Time:</span>
                                        <span className="font-semibold text-xs">
                                            {new Date(selectedTicket.exit_time).toLocaleString('en-US', {
                                                month: '2-digit', day: '2-digit', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit', hour12: true
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Rate Type:</span>
                                        <span className="font-bold capitalize">
                                            {selectedTicket.rate_type === 'flat_rate' ? 'Flat Rate' :
                                             selectedTicket.rate_type === 'overnight' ? 'Overnight' : 'Hourly'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Method:</span>
                                        <span className="font-bold uppercase">{selectedTicket.payment.payment_method}</span>
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-gray-300 my-4"></div>

                                {/* Amount */}
                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-gray-500 mb-1">TOTAL AMOUNT</p>
                                    <p className="text-4xl font-bold text-green-600">₱{Number(selectedTicket.payment.amount).toFixed(2)}</p>
                                </div>

                                <div className="border-t border-dashed border-gray-300 my-4"></div>

                                {/* Footer */}
                                <div className="text-center text-xs text-gray-500 space-y-1">
                                    <p>Collected by: {selectedTicket.agent?.name || 'N/A'}</p>
                                    <p>{new Date(selectedTicket.payment.paid_at).toLocaleString()}</p>
                                    <p className="pt-3">This is an official receipt</p>
                                    <p>Please keep for your records</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
