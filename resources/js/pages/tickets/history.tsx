import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle, XCircle, Clock, Car, MapPin, DollarSign, ChevronLeft, ChevronRight, Filter, Search, X, Calendar, Eye, Loader2 } from 'lucide-react';
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
                <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    {!tickets?.data || tickets.data.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No ticket history</p>
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
                                                Duration
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                Amount
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                Payment Method
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                Receipt #
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                Date & Time
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {tickets.data.map((ticket) => {
                                            const amount = ticket.payment 
                                                ? Number(ticket.payment.amount) || 0 
                                                : Number(ticket.price) || 0;
                                            
                                            return (
                                                <tr 
                                                    key={ticket.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                                            ticket.status === 'paid'
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                            {ticket.status === 'paid' ? (
                                                                <><CheckCircle className="h-3 w-3" /> Paid</>
                                                            ) : (
                                                                <><XCircle className="h-3 w-3" /> Cancelled</>
                                                            )}
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
                                                            {calculateDuration(ticket.entry_time, ticket.exit_time)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                            ₱{amount.toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                            {ticket.payment?.payment_method || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {ticket.payment?.receipt_number || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {new Date(ticket.payment?.paid_at || ticket.exit_time).toLocaleString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
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
        </AppLayout>
    );
}
