import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, XCircle, Clock, Car, MapPin, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    payment?: {
        amount: number;
        payment_method: string;
        paid_at: string;
        receipt_number: string;
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
}

export default function History({ tickets }: HistoryProps) {
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
            
            <div className="max-w-6xl mx-auto p-6">
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

                {/* History List */}
                <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                    {!tickets?.data || tickets.data.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No ticket history</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                {tickets.data.map((ticket) => {
                                    const amount = ticket.payment 
                                        ? Number(ticket.payment.amount) || 0 
                                        : Number(ticket.price) || 0;
                                    
                                    return (
                                        <div
                                            key={ticket.id}
                                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                {/* Left: Status & Ticket Info */}
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                                                        ticket.status === 'paid'
                                                            ? 'bg-green-100 dark:bg-green-900'
                                                            : 'bg-red-100 dark:bg-red-900'
                                                    }`}>
                                                        {ticket.status === 'paid' ? (
                                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                                                {ticket.plate_number || 'No Plate'}
                                                            </p>
                                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                                ticket.status === 'paid'
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                            }`}>
                                                                {ticket.status === 'paid' ? 'Paid' : 'Cancelled'}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {ticket.ticket_id}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {/* Middle: Details */}
                                                <div className="flex items-center gap-4 flex-shrink-0 text-xs text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        <span>{ticket.parking_zone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span>{calculateDuration(ticket.entry_time, ticket.exit_time)}</span>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded ${
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
                                                
                                                {/* Right: Amount & Payment Info */}
                                                <div className="flex items-center gap-4 flex-shrink-0">
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                            ₱{amount.toFixed(2)}
                                                        </p>
                                                        {ticket.payment && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                                {ticket.payment.payment_method}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 w-32">
                                                        {ticket.payment ? (
                                                            <>
                                                                <p className="truncate">#{ticket.payment.receipt_number}</p>
                                                                <p>{new Date(ticket.payment.paid_at).toLocaleDateString()}</p>
                                                            </>
                                                        ) : (
                                                            <p>{new Date(ticket.exit_time).toLocaleDateString()}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
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
