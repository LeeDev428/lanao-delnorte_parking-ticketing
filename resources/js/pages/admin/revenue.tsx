import AdminLayout from '@/layouts/admin/admin-layout';
import { Head, router } from '@inertiajs/react';
import {
    DollarSign,
    TrendingUp,
    Calendar,
    Download,
    CreditCard,
    Banknote,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import Chart from 'react-apexcharts';

interface Transaction {
    id: number;
    ticket_id: string;
    amount: number;
    payment_method: string;
    paid_at: string;
    collected_by: string;
}

interface RevenueData {
    today: number;
    week: number;
    month: number;
    year: number;
    byPaymentMethod: {
        cash: number;
        gcash: number;
        card: number;
    };
    recentTransactions?: Transaction[];
    dateRange?: {
        start_date: string;
        end_date: string;
    };
}

interface RevenueProps {
    revenue: RevenueData;
}

export default function Revenue({ revenue }: RevenueProps) {
    const [startDate, setStartDate] = useState(revenue.dateRange?.start_date || '');
    const [endDate, setEndDate] = useState(revenue.dateRange?.end_date || '');

    // Use real data from backend
    const revenueData: RevenueData = revenue || {
        today: 0,
        week: 0,
        month: 0,
        year: 0,
        byPaymentMethod: {
            cash: 0,
            gcash: 0,
            card: 0,
        },
        recentTransactions: [],
    };

    // Apply date range filter
    const applyDateFilter = () => {
        router.get('/admin/revenue', {
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Reset date filter
    const resetDateFilter = () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        setStartDate(firstDay.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        router.get('/admin/revenue');
    };

    // Calculate total for percentage calculation
    const totalByPaymentMethod = 
        revenueData.byPaymentMethod.cash +
        revenueData.byPaymentMethod.gcash +
        revenueData.byPaymentMethod.card;

    // Calculate percentages based on actual amounts
    const cashPercentage = totalByPaymentMethod > 0 
        ? Math.round((revenueData.byPaymentMethod.cash / totalByPaymentMethod) * 100) 
        : 0;
    const gcashPercentage = totalByPaymentMethod > 0 
        ? Math.round((revenueData.byPaymentMethod.gcash / totalByPaymentMethod) * 100) 
        : 0;
    const cardPercentage = totalByPaymentMethod > 0 
        ? Math.round((revenueData.byPaymentMethod.card / totalByPaymentMethod) * 100) 
        : 0;

    const handleExportReport = (type: string) => {
        router.get('/admin/reports/export', { type }, {
            preserveState: true,
            onSuccess: () => {
                // Success notification could be added here
            }
        });
    };

    return (
        <AdminLayout title="Revenue Reports">
            <Head title="Revenue Reports" />

            <div className="space-y-6">
                {/* Revenue Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <RevenueCard
                        title="Today's Revenue"
                        amount={revenueData.today}
                        icon={<DollarSign className="h-6 w-6" />}
                        color="blue"
                    />
                    <RevenueCard
                        title="This Week"
                        amount={revenueData.week}
                        icon={<Calendar className="h-6 w-6" />}
                        color="green"
                    />
                    <RevenueCard
                        title="This Month"
                        amount={revenueData.month}
                        icon={<TrendingUp className="h-6 w-6" />}
                        color="purple"
                    />
                    <RevenueCard
                        title="This Year"
                        amount={revenueData.year}
                        icon={<TrendingUp className="h-6 w-6" />}
                        color="indigo"
                    />
                </div>

                {/* Payment Methods Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Revenue by Payment Method
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <PaymentMethodRow
                                    method="Cash"
                                    amount={revenueData.byPaymentMethod.cash}
                                    icon={<Banknote className="h-5 w-5 text-green-600" />}
                                    percentage={cashPercentage}
                                    color="green"
                                />
                                <PaymentMethodRow
                                    method="GCash"
                                    amount={revenueData.byPaymentMethod.gcash}
                                    icon={<CreditCard className="h-5 w-5 text-blue-600" />}
                                    percentage={gcashPercentage}
                                    color="blue"
                                />
                                <PaymentMethodRow
                                    method="Card"
                                    amount={revenueData.byPaymentMethod.card}
                                    icon={<CreditCard className="h-5 w-5 text-purple-600" />}
                                    percentage={cardPercentage}
                                    color="purple"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Bar Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Payment Distribution
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="h-64">
                                {typeof window !== 'undefined' && (
                                    <Chart
                                        options={{
                                            chart: {
                                                type: 'bar',
                                                background: 'transparent',
                                                toolbar: {
                                                    show: false,
                                                },
                                            },
                                            plotOptions: {
                                                bar: {
                                                    borderRadius: 8,
                                                    distributed: true,
                                                    horizontal: false,
                                                    columnWidth: '60%',
                                                },
                                            },
                                            colors: ['#10B981', '#3B82F6', '#A855F7'],
                                            dataLabels: {
                                                enabled: true,
                                                formatter: (val: number) => `₱${val.toLocaleString()}`,
                                                style: {
                                                    fontSize: '12px',
                                                    colors: ['#fff'],
                                                },
                                            },
                                            legend: {
                                                show: false,
                                            },
                                            xaxis: {
                                                categories: ['Cash', 'GCash', 'Card'],
                                                labels: {
                                                    style: {
                                                        colors: '#9CA3AF',
                                                        fontSize: '12px',
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
                                                xaxis: {
                                                    lines: {
                                                        show: false,
                                                    },
                                                },
                                            },
                                            tooltip: {
                                                theme: 'dark',
                                                y: {
                                                    formatter: (value: number) => `₱${value.toLocaleString()}`,
                                                },
                                            },
                                        }}
                                        series={[
                                            {
                                                name: 'Revenue',
                                                data: [
                                                    revenueData.byPaymentMethod.cash,
                                                    revenueData.byPaymentMethod.gcash,
                                                    revenueData.byPaymentMethod.card,
                                                ],
                                            },
                                        ]}
                                        type="bar"
                                        height="100%"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Transactions
                            </h3>
                            
                            {/* Date Range Filter */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                                    />
                                    <span className="text-gray-500 text-sm">to</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                                    />
                                </div>
                                <button
                                    onClick={applyDateFilter}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={resetDateFilter}
                                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Payment ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Ticket ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Method
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Collected By
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {revenueData.recentTransactions && revenueData.recentTransactions.length > 0 ? (
                                    revenueData.recentTransactions.map((transaction) => (
                                        <tr
                                            key={transaction.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    #{transaction.id}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {transaction.ticket_id}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    ₱ {Number(transaction.amount).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                                    transaction.payment_method === 'cash'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : transaction.payment_method === 'gcash'
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                }`}>
                                                    {transaction.payment_method}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(transaction.paid_at).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {transaction.collected_by}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            No transactions found for the selected date range
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function RevenueCard({
    title,
    amount,
    icon,
    color,
}: {
    title: string;
    amount: number;
    icon: React.ReactNode;
    color: string;
}) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                ₱ {amount.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        </div>
    );
}

function PaymentMethodRow({
    method,
    amount,
    icon,
    percentage,
    color = 'blue',
}: {
    method: string;
    amount: number;
    icon: React.ReactNode;
    percentage: number;
    color?: string;
}) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-600',
        green: 'bg-green-600',
        purple: 'bg-purple-600',
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {icon}
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{method}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                    ₱ {amount.toLocaleString()}
                </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                    className={`${colorClasses[color]} dark:${colorClasses[color]} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
