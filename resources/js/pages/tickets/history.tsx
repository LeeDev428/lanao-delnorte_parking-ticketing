import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { CheckCircle, XCircle, Clock, Car, MapPin, DollarSign } from 'lucide-react';

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
                            <p className="text-3xl font-bold">{tickets?.data?.length || 0}</p>
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
                        <div className="space-y-4">
                            {tickets.data.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`p-2 rounded-lg ${
                                                    ticket.status === 'paid'
                                                        ? 'bg-green-100 dark:bg-green-900'
                                                        : 'bg-red-100 dark:bg-red-900'
                                                }`}>
                                                    {ticket.status === 'paid' ? (
                                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                                                        {ticket.plate_number || 'No Plate'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {ticket.ticket_id}
                                                    </p>
                                                </div>
                                                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                                                    ticket.status === 'paid'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                }`}>
                                                    {ticket.status === 'paid' ? 'Paid' : 'Cancelled'}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-4 gap-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {ticket.parking_zone}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {calculateDuration(ticket.entry_time, ticket.exit_time)}
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
                                                        {ticket.rate_type === 'flat_rate' ? 'Flat' : 
                                                         ticket.rate_type === 'overnight' ? 'Overnight' : 'Hourly'}
                                                    </span>
                                                </div>
                                                {ticket.payment && (
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4 text-gray-400" />
                                                        <span className="text-gray-600 dark:text-gray-400 uppercase text-xs">
                                                            {ticket.payment.payment_method}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {ticket.payment && (
                                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500 dark:text-gray-400">
                                                            Receipt: {ticket.payment.receipt_number}
                                                        </span>
                                                        <span className="text-gray-500 dark:text-gray-400">
                                                            {new Date(ticket.payment.paid_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="text-right ml-4">
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                ₱{ticket.payment ? ticket.payment.amount.toFixed(2) : ticket.price.toFixed(2)}
                                            </p>
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
