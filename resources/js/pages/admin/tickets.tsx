import AdminLayout from '@/layouts/admin/admin-layout';
import { Head, router } from '@inertiajs/react';
import { Search, Filter, Download, Eye, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

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

interface PaginatedTickets {
    data: Ticket[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface TicketsProps {
    tickets: PaginatedTickets;
    filters?: {
        status?: string;
        search?: string;
        start_date?: string;
        end_date?: string;
        per_page?: number;
    };
}

export default function Tickets({ tickets, filters = {} }: TicketsProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [filterStatus, setFilterStatus] = useState<string>(filters.status || 'all');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [perPage, setPerPage] = useState(filters.per_page || 20);

    // Apply filters
    const applyFilters = () => {
        router.get('/admin/tickets', {
            status: filterStatus !== 'all' ? filterStatus : undefined,
            search: searchQuery || undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            per_page: perPage,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Reset filters
    const resetFilters = () => {
        setSearchQuery('');
        setFilterStatus('all');
        setStartDate('');
        setEndDate('');
        setPerPage(20);
        router.get('/admin/tickets');
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (filterStatus !== 'all') params.append('status', filterStatus);
        if (searchQuery) params.append('search', searchQuery);
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        window.location.href = `/admin/tickets/export?${params.toString()}`;
    };

    // Pagination handler
    const goToPage = (page: number) => {
        router.get('/admin/tickets', {
            page,
            status: filterStatus !== 'all' ? filterStatus : undefined,
            search: searchQuery || undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            per_page: perPage,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout title="Ticket Management">
            <Head title="Ticket Management" />

            <div className="space-y-6">
                {/* Filters Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Ticket ID or Plate..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="paid">Paid</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Start Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                End Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700 dark:text-gray-300">Per page:</label>
                            <select
                                value={perPage}
                                onChange={(e) => setPerPage(Number(e.target.value))}
                                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Filter className="h-4 w-4" />
                                Apply Filters
                            </button>
                            <button 
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                Export
                            </button>
                        </div>
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
                                {tickets.data.map((ticket) => (
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {tickets.data.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">No tickets found</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {tickets.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                Showing <span className="font-medium">{tickets.from}</span> to{' '}
                                <span className="font-medium">{tickets.to}</span> of{' '}
                                <span className="font-medium">{tickets.total}</span> results
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => goToPage(tickets.current_page - 1)}
                                    disabled={tickets.current_page === 1}
                                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </button>
                                
                                {/* Page numbers */}
                                <div className="flex gap-1">
                                    {Array.from({ length: Math.min(5, tickets.last_page) }, (_, i) => {
                                        let pageNum;
                                        if (tickets.last_page <= 5) {
                                            pageNum = i + 1;
                                        } else if (tickets.current_page <= 3) {
                                            pageNum = i + 1;
                                        } else if (tickets.current_page >= tickets.last_page - 2) {
                                            pageNum = tickets.last_page - 4 + i;
                                        } else {
                                            pageNum = tickets.current_page - 2 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => goToPage(pageNum)}
                                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                                    tickets.current_page === pageNum
                                                        ? 'bg-blue-600 text-white'
                                                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => goToPage(tickets.current_page + 1)}
                                    disabled={tickets.current_page === tickets.last_page}
                                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
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
