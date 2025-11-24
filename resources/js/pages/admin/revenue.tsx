import AdminLayout from '@/layouts/admin/admin-layout';
import { Head } from '@inertiajs/react';
import {
    DollarSign,
    TrendingUp,
    Calendar,
    Download,
    CreditCard,
    Banknote,
} from 'lucide-react';

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
}

interface RevenueProps {
    revenue: RevenueData;
}

export default function Revenue({ revenue }: RevenueProps) {
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

    const recentTransactions = [
        {
            id: 1,
            receipt: 'TKT-23041',
            ticket: 'P23-0214',
            amount: 40.0,
            method: 'cash',
            time: '3:45 PM',
            agent: 'John Doe',
        },
        {
            id: 2,
            receipt: 'TKT-23042',
            ticket: 'P23-0215',
            amount: 50.0,
            method: 'gcash',
            time: '2:30 PM',
            agent: 'Jane Smith',
        },
        {
            id: 3,
            receipt: 'TKT-23043',
            ticket: 'P23-0216',
            amount: 100.0,
            method: 'card',
            time: '1:15 PM',
            agent: 'John Doe',
        },
        {
            id: 4,
            receipt: 'TKT-23044',
            ticket: 'P23-0217',
            amount: 40.0,
            method: 'cash',
            time: '12:00 PM',
            agent: 'Jane Smith',
        },
    ];

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
                                />
                                <PaymentMethodRow
                                    method="GCash"
                                    amount={revenueData.byPaymentMethod.gcash}
                                    icon={<CreditCard className="h-5 w-5 text-blue-600" />}
                                    percentage={gcashPercentage}
                                />
                                <PaymentMethodRow
                                    method="Card"
                                    amount={revenueData.byPaymentMethod.card}
                                    icon={<CreditCard className="h-5 w-5 text-purple-600" />}
                                    percentage={cardPercentage}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Export Reports
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                                    <span className="text-blue-700 dark:text-blue-300 font-medium">
                                        Daily Report
                                    </span>
                                    <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </button>
                                <button className="w-full flex items-center justify-between px-4 py-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors">
                                    <span className="text-green-700 dark:text-green-300 font-medium">
                                        Weekly Report
                                    </span>
                                    <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </button>
                                <button className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                                    <span className="text-purple-700 dark:text-purple-300 font-medium">
                                        Monthly Report
                                    </span>
                                    <Download className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </button>
                                <button className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                                    <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                                        Custom Range
                                    </span>
                                    <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Recent Transactions
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Receipt No.
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
                                        Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Agent
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {recentTransactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {transaction.receipt}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {transaction.ticket}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                ₱ {transaction.amount.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                {transaction.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {transaction.time}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {transaction.agent}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
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
}: {
    method: string;
    amount: number;
    icon: React.ReactNode;
    percentage: number;
}) {
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
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
