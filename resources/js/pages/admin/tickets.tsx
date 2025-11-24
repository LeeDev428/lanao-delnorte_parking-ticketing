import AdminLayout from '@/layouts/admin/admin-layout';
import { Head } from '@inertiajs/react';
import { Search, Filter, Download, Eye } from 'lucide-react';
import { useState } from 'react';

interface Ticket {
    id: number;
    ticket_id: string;
    plate_number: string;
    parking_zone: string;
    rate_type: string;
    price: number;
    entry_time: string;
    duration_minutes: number | null;
    status: 'active' | 'paid' | 'cancelled';
    agent: {
        name: string;
    };
}

interface TicketsProps {
    tickets: Ticket[] | { data: Ticket[] } | any;
}

export default function Tickets({ tickets }: TicketsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Ensure tickets is always an array - handle both array and paginated object
    const ticketData = tickets?.data || tickets || [];
    const mockTickets: Ticket[] = Array.isArray(ticketData) ? ticketData : [
        {
            id: 1,
            ticket_id: 'P23-0214',
            plate_number: 'ABC-1234',
            parking_zone: 'Zone 3',
            rate_type: 'hourly',
            price: 40.0,
            entry_time: '2025-10-23T15:24:00',
            duration_minutes: 74,
            status: 'paid',
            agent: { name: 'John Doe' },
        },
        {
            id: 2,
            ticket_id: 'P23-0215',
            plate_number: 'XYZ-5678',
            parking_zone: 'Zone 1',
            rate_type: 'flat_rate',
            price: 50.0,
            entry_time: '2025-10-23T14:10:00',
            duration_minutes: null,
            status: 'active',
            agent: { name: 'Jane Smith' },
        },
        {
            id: 3,
            ticket_id: 'P23-0216',
            plate_number: 'DEF-9012',
            parking_zone: 'Zone 2',
            rate_type: 'overnight',
            price: 100.0,
            entry_time: '2025-10-23T13:45:00',
            duration_minutes: 180,
            status: 'paid',
            agent: { name: 'John Doe' },
        },
    ];

    const filteredTickets = mockTickets.filter((ticket) => {
        const matchesSearch =
            ticket.ticket_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.plate_number.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <AdminLayout title="Ticket Management">
            <Head title="Ticket Management" />

            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by ticket ID or plate..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="paid">Paid</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Tickets Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Ticket ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Plate Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Zone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Rate Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Agent
                                    </th>
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th> */}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredTickets.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {ticket.ticket_id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {ticket.plate_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {ticket.parking_zone}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                {ticket.rate_type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                ₱ {Number(ticket.price).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {ticket.duration_minutes
                                                    ? `${Math.floor(ticket.duration_minutes / 60)}h ${ticket.duration_minutes % 60}m`
                                                    : '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={ticket.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {ticket.agent.name}
                                            </span>
                                        </td>
                                        {/* <td className="px-6 py-4 whitespace-nowrap">
                                            <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                                <Eye className="h-5 w-5" />
                                            </button>
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredTickets.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">No tickets found</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function StatusBadge({ status }: { status: 'active' | 'paid' | 'cancelled' }) {
    const statusStyles = {
        active: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
        <span
            className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${statusStyles[status]}`}
        >
            {status}
        </span>
    );
}
