import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Car, DollarSign, Clock, ParkingSquare, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    stats: {
        todayTickets: number;
        totalCollected: number;
        activeTickets: number;
        availableSlots: number;
    };
    activeTickets: Array<{
        id: number;
        ticket_id: string;
        plate_number: string;
        duration_minutes: number;
        status: string;
    }>;
}

export default function Dashboard({ stats, activeTickets }: DashboardProps) {
    const mockStats = stats || {
        todayTickets: 124,
        totalCollected: 940,
        activeTickets: 3,
        availableSlots: 37,
    };

    const mockActiveTickets = activeTickets || [
        { id: 1, ticket_id: 'P23-0214', plate_number: 'ABC-1234', duration_minutes: 28, status: 'active' },
        { id: 2, ticket_id: 'P23-0215', plate_number: 'XY2-5678', duration_minutes: 15, status: 'active' },
        { id: 3, ticket_id: 'P23-0216', plate_number: 'DEF-9012', duration_minutes: 40, status: 'active' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 sm:gap-6 p-3 sm:p-6">
                {/* Welcome Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Welcome back! Monitor active parking tickets.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    <StatCard
                        title="Today's Total Tickets"
                        value={mockStats.todayTickets}
                        icon={<Car className="h-6 w-6" />}
                        color="blue"
                        subtitle="Total tickets issued"
                    />
                    <StatCard
                        title="Total Collected"
                        value={`₱ ${mockStats.totalCollected}`}
                        icon={<DollarSign className="h-6 w-6" />}
                        color="green"
                        subtitle="Today's revenue"
                    />
                    <StatCard
                        title="Active Tickets"
                        value={mockStats.activeTickets}
                        icon={<Clock className="h-6 w-6" />}
                        color="yellow"
                        subtitle="Currently parked"
                    />
                    <StatCard
                        title="Available Slots"
                        value={`${mockStats.availableSlots}/200`}
                        icon={<Car className="h-6 w-6" />}
                        color="purple"
                        subtitle="Parking spaces"
                    />
                </div>

                {/* Active Tickets Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Tickets</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Vehicles currently in parking</p>
                        </div>
                        <Link
                            href="/tickets"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium text-sm"
                        >
                            View All →
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {mockActiveTickets.length > 0 ? (
                            mockActiveTickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="p-3 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg flex-shrink-0">
                                            <Car className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                                Plate: {ticket.plate_number}
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                                Ticket ID: {ticket.ticket_id}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 self-end sm:self-auto">
                                        <div className="text-right">
                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Duration</p>
                                            <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                                                {Math.floor(ticket.duration_minutes)} min
                                            </p>
                                        </div>
                                        <span className="px-2 sm:px-3 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full whitespace-nowrap">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 sm:p-12 text-center">
                                <Car className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No active tickets</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Action Button - New Ticket */}
                <Link
                    href="/tickets/create"
                    className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-full p-3 sm:p-4 shadow-lg transition-all duration-200 hover:scale-110 z-50"
                    title="New Ticket"
                >
                    <Plus className="h-7 w-7 sm:h-8 sm:w-8" />
                </Link>
            </div>
        </AppLayout>
    );
}

function StatCard({
    title,
    value,
    icon,
    color,
    subtitle,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'yellow' | 'purple';
    subtitle: string;
}) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 break-words">{value}</h3>
            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        </div>
    );
}
