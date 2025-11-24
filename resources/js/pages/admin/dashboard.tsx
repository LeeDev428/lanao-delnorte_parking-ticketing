import AdminLayout from '@/layouts/admin/admin-layout';
import { Head } from '@inertiajs/react';
import {
    TrendingUp,
    Ticket,
    DollarSign,
    Users,
    Clock,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { useMemo } from 'react';
import Chart from 'react-apexcharts';

interface DashboardStats {
    todayTickets: number;
    totalRevenue: number;
    activeTickets: number;
    availableSlots: number;
    totalSlots: number;
    todayRevenue: number;
    paidTickets: number;
    cancelledTickets: number;
    activeTicketsList: Array<{
        id: number;
        ticket_id: string;
        plate_number: string;
        duration_minutes: number;
        status: string;
    }>;
    revenueData?: {
        dates: string[];
        amounts: number[];
    };
}

interface DashboardProps {
    stats: DashboardStats;
}

export default function Dashboard({ stats }: DashboardProps) {
    // Generate mock revenue data for the chart (last 7 days)
    const chartData = useMemo(() => {
        if (stats?.revenueData) {
            return stats.revenueData;
        }
        
        // Default mock data
        const dates: string[] = [];
        const amounts: number[] = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            amounts.push(Math.floor(Math.random() * 5000) + 2000);
        }
        
        return { dates, amounts };
    }, [stats]);

    const chartOptions = {
        chart: {
            type: 'area' as const,
            height: 280,
            toolbar: {
                show: false,
            },
            background: 'transparent',
        },
        colors: ['#3B82F6'],
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth' as const,
            width: 3,
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 90, 100],
            },
        },
        xaxis: {
            categories: chartData.dates,
            labels: {
                style: {
                    colors: '#9CA3AF',
                },
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#9CA3AF',
                },
                formatter: (value: number) => `₱${value.toFixed(0)}`,
            },
        },
        grid: {
            borderColor: '#374151',
            strokeDashArray: 4,
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: (value: number) => `₱${value.toFixed(2)}`,
            },
        },
    };

    const chartSeries = [
        {
            name: 'Revenue',
            data: chartData.amounts,
        },
    ];

    return (
        <AdminLayout title="Dashboard">
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Today's Tickets"
                        value={stats?.todayTickets || 0}
                        icon={<Ticket className="h-6 w-6" />}
                        color="blue"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`₱ ${stats?.todayRevenue || 0}`}
                        icon={<DollarSign className="h-6 w-6" />}
                        color="green"
                    />
                    <StatCard
                        title="Active Tickets"
                        value={stats?.activeTickets || 0}
                        icon={<Clock className="h-6 w-6" />}
                        color="yellow"
                    />
                    <StatCard
                        title="Available Slots"
                        value={`${stats?.availableSlots || 0}/${stats?.totalSlots || 200}`}
                        icon={<Users className="h-6 w-6" />}
                        color="purple"
                    />
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active Tickets */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Active Tickets
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {stats?.activeTicketsList && stats.activeTicketsList.length > 0 ? (
                                    stats.activeTicketsList.map((ticket) => (
                                        <ActiveTicketRow
                                            key={ticket.id}
                                            plate={ticket.plate_number}
                                            duration={`${Math.floor(ticket.duration_minutes)} min`}
                                            status="Active"
                                        />
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                        No active tickets
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Today's Summary
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <SummaryRow
                                    label="Total Collected"
                                    value={`₱ ${Number(stats?.totalRevenue || 0).toFixed(2)}`}
                                    icon={<DollarSign className="h-5 w-5 text-green-600" />}
                                />
                                <SummaryRow
                                    label="Paid Tickets"
                                    value={stats?.paidTickets || 0}
                                    icon={<CheckCircle className="h-5 w-5 text-blue-600" />}
                                />
                                <SummaryRow
                                    label="Cancelled"
                                    value={stats?.cancelledTickets || 0}
                                    icon={<XCircle className="h-5 w-5 text-red-600" />}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue Overview Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Revenue Overview
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="h-72">
                            {typeof window !== 'undefined' && (
                                <Chart
                                    options={chartOptions}
                                    series={chartSeries}
                                    type="area"
                                    height="100%"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'yellow' | 'purple';
}) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        </div>
    );
}

function ActiveTicketRow({
    plate,
    duration,
    status,
}: {
    plate: string;
    duration: string;
    status: string;
}) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div>
                <p className="font-medium text-gray-900 dark:text-white">Plate: {plate}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Duration: {duration}</p>
            </div>
            <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                {status}
            </span>
        </div>
    );
}

function SummaryRow({
    label,
    value,
    icon,
}: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div className="flex items-center space-x-3">
                {icon}
                <span className="text-gray-700 dark:text-gray-300">{label}</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
        </div>
    );
}
