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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tickets.data.map((ticket) => {
                                    const amount = ticket.payment 
                                        ? Number(ticket.payment.amount) || 0 
                                        : Number(ticket.price) || 0;
                                    
                                    return (
                                        <div
                                            key={ticket.id}
                                            className={`border-2 rounded-xl p-4 hover:shadow-lg transition-all ${
                                                ticket.status === 'paid'
                                                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                                                    : 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
                                            }`}
                                        >
                                            {/* Header with Status Icon */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`p-2 rounded-lg ${
                                                    ticket.status === 'paid'
                                                        ? 'bg-green-500'
                                                        : 'bg-red-500'
                                                }`}>
                                                    {ticket.status === 'paid' ? (
                                                        <CheckCircle className="h-5 w-5 text-white" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-white" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-base text-gray-900 dark:text-white">
                                                            {ticket.plate_number || 'No Plate'}
                                                        </h3>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                            ticket.status === 'paid'
                                                                ? 'bg-green-600 text-white'
                                                                : 'bg-red-600 text-white'
                                                        }`}>
                                                            {ticket.status === 'paid' ? 'Paid' : 'Cancelled'}
                                                        </span>
                                                    </div>
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
                                                        {calculateDuration(ticket.entry_time, ticket.exit_time)}
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
                                            <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    ₱{amount.toFixed(2)}
                                                </p>
                                                {ticket.payment && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">
                                                        via {ticket.payment.payment_method}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Receipt Info */}
                                            {ticket.payment ? (
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        <span className="font-medium">Receipt:</span> {ticket.payment.receipt_number}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(ticket.payment.paid_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Cancelled on {new Date(ticket.exit_time).toLocaleString()}
                                                </p>
                                            )}
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
