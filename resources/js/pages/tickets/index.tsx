import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Clock, Car, MapPin, CreditCard, XCircle, CheckCircle, ChevronLeft, ChevronRight, Filter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';

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
    const [selectedZone, setSelectedZone] = useState(filters.zone || 'all');
    const [selectedRateType, setSelectedRateType] = useState(filters.rate_type || 'all');
    const [showFilters, setShowFilters] = useState(false);
    const { props } = usePage();
    const successMessage = props.success as string | undefined;

    const applyFilters = () => {
        router.get('/tickets', {
            search: searchTerm || undefined,
            zone: selectedZone !== 'all' ? selectedZone : undefined,
            rate_type: selectedRateType !== 'all' ? selectedRateType : undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedZone('all');
        setSelectedRateType('all');
        router.get('/tickets', {}, { preserveState: true });
    };

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
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
                                <Label htmlFor="zone" className="text-xs">Parking Zone</Label>
                                <Select value={selectedZone} onValueChange={setSelectedZone}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Zones</SelectItem>
                                        {parkingZones.map(zone => (
                                            <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                                        ))}
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

                {/* Tickets List */}
                <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tickets.data.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-xl p-4 hover:shadow-lg transition-all"
                                    >
                                        {/* Header with Car Icon */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-blue-500 p-2 rounded-lg">
                                                <Car className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                                                    {ticket.plate_number || 'No Plate'}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {ticket.ticket_id}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600 dark:text-gray-300">{ticket.parking_zone}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600 dark:text-gray-300">
                                                    {calculateElapsedTime(ticket.entry_time)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                                    ticket.rate_type === 'hourly' 
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                                        : ticket.rate_type === 'flat_rate'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                                }`}>
                                                    {ticket.rate_type === 'flat_rate' ? 'Flat Rate' : 
                                                     ticket.rate_type === 'overnight' ? 'Overnight' : 'Hourly'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                ₱{(calculateCurrentCharge(ticket) || 0).toFixed(2)}
                                            </p>
                                            {ticket.rate_type === 'hourly' && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Current charge
                                                </p>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            {ticket.rate_type === 'hourly' && (
                                                <Link href={`/tickets/${ticket.id}/payment`} className="flex-1">
                                                    <Button className="w-full bg-green-600 hover:bg-green-700 h-9">
                                                        <CreditCard className="h-4 w-4 mr-2" />
                                                        Pay Now
                                                    </Button>
                                                </Link>
                                            )}
                                            <Button 
                                                variant="destructive"
                                                onClick={() => handleDeactivate(ticket.id)}
                                                className={`bg-red-600 hover:bg-red-700 h-9 ${ticket.rate_type === 'hourly' ? '' : 'w-full'}`}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Deactivate
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        {/* Pagination */}
                        {tickets.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
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
        </AppLayout>
    );
}