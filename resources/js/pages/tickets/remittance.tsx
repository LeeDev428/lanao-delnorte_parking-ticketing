import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, router } from '@inertiajs/react';
import { DollarSign, Banknote, CreditCard, Wallet, Receipt, Filter, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Payment {
    id: number;
    receipt_number: string;
    amount: number;
    payment_method: 'cash' | 'gcash' | 'card';
    paid_at: string;
    plate_number: string;
}

interface RemittanceProps {
    payments: Payment[];
    summary: {
        total_cash: number;
        total_gcash: number;
        total_card: number;
        grand_total: number;
        cash_to_remit: number;
        transaction_count: number;
    };
    filters: {
        start_date: string;
        end_date: string;
    };
}

export default function Remittance({ payments, summary, filters }: RemittanceProps) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const applyFilters = () => {
        router.get('/tickets/remittance', {
            start_date: startDate,
            end_date: endDate,
        }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'My Remittance', href: '/tickets/remittance' },
        ]}>
            <Head title="My Remittance" />

            <div className="flex h-full flex-1 flex-col gap-4 sm:gap-6 p-3 sm:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Remittance</h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                            Track your collections and remittance requirements
                        </p>
                    </div>

                    {/* Remittance Alert */}
                    {summary.cash_to_remit > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                                        Cash Remittance Required
                                    </h3>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                        You have collected <strong>₱{summary.cash_to_remit.toFixed(2)}</strong> in cash that needs to be remitted.
                                    </p>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                                        Note: GCash (₱{summary.total_gcash.toFixed(2)}) and Card (₱{summary.total_card.toFixed(2)}) payments are digital and do not require physical remittance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Date Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Date Range</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="start_date" className="text-sm">Start Date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="end_date" className="text-sm">End Date</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={applyFilters} className="w-full">Apply Filters</Button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <SummaryCard
                        title="Cash Collected"
                        value={`₱${summary.total_cash.toFixed(2)}`}
                        subtitle="To remit"
                        icon={<Banknote className="h-5 w-5 sm:h-6 sm:w-6" />}
                        color="green"
                        highlight
                    />
                    <SummaryCard
                        title="GCash Collected"
                        value={`₱${summary.total_gcash.toFixed(2)}`}
                        subtitle="Digital payment"
                        icon={<Wallet className="h-5 w-5 sm:h-6 sm:w-6" />}
                        color="blue"
                    />
                    <SummaryCard
                        title="Card Collected"
                        value={`₱${summary.total_card.toFixed(2)}`}
                        subtitle="Digital payment"
                        icon={<CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />}
                        color="purple"
                    />
                </div>

                {/* Total Summary */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <Receipt className="h-5 w-5 sm:h-6 sm:w-6" />
                                <p className="text-sm sm:text-base opacity-90">Total Collections</p>
                            </div>
                            <p className="text-3xl sm:text-4xl md:text-5xl font-bold break-words">
                                ₱{summary.grand_total.toFixed(2)}
                            </p>
                            <p className="text-sm opacity-75 mt-2">
                                {summary.transaction_count} transaction{summary.transaction_count !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="bg-white/20 p-3 sm:p-4 rounded-full flex-shrink-0">
                            <DollarSign className="h-8 w-8 sm:h-12 sm:w-12" />
                        </div>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h2>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Detailed breakdown of all your collections
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Receipt</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Plate</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Method</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date/Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {payments.length > 0 ? (
                                    payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{payment.receipt_number}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{payment.plate_number}</td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold text-green-600 dark:text-green-400">
                                                ₱{payment.amount.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <PaymentMethodBadge method={payment.payment_method} />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(payment.paid_at).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                                            No transactions found for selected period
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function SummaryCard({
    title,
    value,
    subtitle,
    icon,
    color,
    highlight = false,
}: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    color: 'green' | 'blue' | 'purple';
    highlight?: boolean;
}) {
    const colorClasses = {
        green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-3 sm:p-4 ${
            highlight ? 'border-green-500 dark:border-green-600' : 'border-gray-200 dark:border-gray-700'
        }`}>
            <div className={`inline-flex p-2 sm:p-3 rounded-lg ${colorClasses[color]} mb-2 sm:mb-3`}>
                {icon}
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1 break-words">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        </div>
    );
}

function PaymentMethodBadge({ method }: { method: 'cash' | 'gcash' | 'card' }) {
    const badgeClasses = {
        cash: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        gcash: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        card: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClasses[method]}`}>
            {method.toUpperCase()}
        </span>
    );
}
