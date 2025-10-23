import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Clock, Car, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Active Tickets', href: '/tickets' },
        ]}>
            <Head title="Active Tickets" />
            
            <div className="max-w-6xl mx-auto p-6">
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
                        <div className="space-y-4">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                                                    <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                                                        {ticket.plate_number || 'No Plate'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {ticket.ticket_id}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {ticket.parking_zone}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {calculateElapsedTime(ticket.entry_time)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
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
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-2 ml-4">
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    ₱{(calculateCurrentCharge(ticket) || 0).toFixed(2)}
                                                </p>
                                                {ticket.rate_type === 'hourly' && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Current</p>
                                                )}
                                            </div>
                                            
                                            {ticket.rate_type === 'hourly' && (
                                                <Link href={`/tickets/${ticket.id}/payment`}>
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                        <CreditCard className="h-4 w-4 mr-1" />
                                                        Pay
                                                    </Button>
                                                </Link>
                                            )}
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
