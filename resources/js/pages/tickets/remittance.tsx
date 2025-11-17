import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, router } from '@inertiajs/react';
import { DollarSign, Banknote, CreditCard, Wallet, Receipt, Filter, AlertCircle, TrendingUp, Search, Eye, EyeOff, Download } from 'lucide-react';
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
        month: string;
    };
}

export default function Remittance({ payments, summary, filters }: RemittanceProps) {
    const [selectedMonth, setSelectedMonth] = useState(filters.month);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAmount, setShowAmount] = useState(true);

    const applyFilters = () => {
        router.get('/tickets/remittance', {
            month: selectedMonth,
        }, { preserveState: true });
    };

    // Filter payments based on search
    const filteredPayments = payments.filter(payment => 
        payment.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.plate_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate average transaction
    const averageTransaction = summary.transaction_count > 0 
        ? summary.grand_total / summary.transaction_count 
        : 0;

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'My Remittance', href: '/tickets/remittance' },
        ]}>
            <Head title="My Remittance" />

            <div className="flex h-full flex-1 flex-col gap-4 p-3 sm:p-4 max-w-7xl mx-auto w-full">
                {/* Header with Big Total */}
                <div className="text-center py-6">
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium mb-2">
                        {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Collection
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
                            {showAmount ? `PHP ${summary.grand_total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'PHP ••••••'}
                        </h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowAmount(!showAmount)}
                            className="h-10 w-10"
                        >
                            {showAmount ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </Button>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {summary.transaction_count} transactions
                    </p>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by receipt or plate number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-auto"
                        />
                        <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700">
                            <Filter className="h-4 w-4 mr-2" />
                            Apply
                        </Button>
                    </div>
                </div>

                {/* Cash Remittance Alert */}
                {summary.cash_to_remit > 0 && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-300 dark:border-yellow-800 p-4 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-yellow-900 dark:text-yellow-200">
                                    💰 Cash Remittance Required
                                </h3>
                                <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                                    <strong className="text-base">₱{summary.cash_to_remit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> in cash needs to be remitted
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sales Summary Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sales Summary</h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gross Sales</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                PHP {summary.grand_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Number of Sales</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                {summary.transaction_count}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net Collected</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                PHP {summary.grand_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Average Sale</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                PHP {averageTransaction.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sales by Payment Methods */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sales by Payment Methods</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-3">
                                <Banknote className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Cash</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {payments.filter(p => p.payment_method === 'cash').length} transactions
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    PHP {summary.total_cash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                    {summary.grand_total > 0 ? ((summary.total_cash / summary.grand_total) * 100).toFixed(1) : 0}%
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-3">
                                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">GCash QR</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {payments.filter(p => p.payment_method === 'gcash').length} transactions
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    PHP {summary.total_gcash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    {summary.grand_total > 0 ? ((summary.total_gcash / summary.grand_total) * 100).toFixed(1) : 0}%
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Card Payment</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {payments.filter(p => p.payment_method === 'card').length} transactions
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    PHP {summary.total_card.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                    {summary.grand_total > 0 ? ((summary.total_card / summary.grand_total) * 100).toFixed(1) : 0}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase">
                                {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {filteredPayments.length} result{filteredPayments.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredPayments.length > 0 ? (
                            filteredPayments.map((payment) => (
                                <div key={payment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                                                <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {new Date(payment.paid_at).toLocaleTimeString('en-US', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit',
                                                            hour12: false 
                                                        })}
                                                    </p>
                                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400 truncate">
                                                        {payment.receipt_number}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {payment.plate_number}
                                                    </p>
                                                    <PaymentMethodBadge method={payment.payment_method} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-4">
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                PHP {Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                                Succeeded
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <Receipt className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                    {searchTerm ? 'Try adjusting your search' : 'No collections for this period'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
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
