import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Clock, Car, MapPin, CreditCard, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    tickets: Ticket[];
}

export default function ActiveTickets({ tickets }: ActiveTicketsProps) {
    const [showSuccess, setShowSuccess] = useState(false);
    const { props } = usePage();
    const successMessage = props.success as string | undefined;

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
            
            <div className="max-w-6xl mx-auto p-6">
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
                            <p className="text-3xl font-bold">{tickets?.length || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Tickets List */}
                <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                    {!tickets || tickets.length === 0 ? (
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
                        <div className="space-y-3">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        {/* Left: Ticket Info */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg flex-shrink-0">
                                                <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-base text-gray-900 dark:text-white truncate">
                                                    {ticket.plate_number || 'No Plate'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {ticket.ticket_id}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Middle: Details */}
                                        <div className="flex items-center gap-4 flex-shrink-0">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span>{ticket.parking_zone}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{calculateElapsedTime(ticket.entry_time)}</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                ticket.rate_type === 'hourly' 
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                                    : ticket.rate_type === 'flat_rate'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                            }`}>
                                                {ticket.rate_type === 'flat_rate' ? 'Flat' : 
                                                 ticket.rate_type === 'overnight' ? 'Overnight' : 'Hourly'}
                                            </span>
                                        </div>
                                        
                                        {/* Right: Price & Actions */}
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                    ₱{(calculateCurrentCharge(ticket) || 0).toFixed(2)}
                                                </p>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                {ticket.rate_type === 'hourly' && (
                                                    <Link href={`/tickets/${ticket.id}/payment`}>
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 px-3">
                                                            <CreditCard className="h-3.5 w-3.5 mr-1" />
                                                            Pay
                                                        </Button>
                                                    </Link>
                                                )}
                                                
                                                <Button 
                                                    size="sm" 
                                                    variant="destructive"
                                                    onClick={() => handleDeactivate(ticket.id)}
                                                    className="bg-red-600 hover:bg-red-700 h-8 px-3"
                                                >
                                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                                    Deactivate
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
