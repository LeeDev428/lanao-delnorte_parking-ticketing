import AppLayout from '@/layouts/app-layout';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, router } from '@inertiajs/react';
import { FileText, DollarSign, Banknote, CreditCard, Wallet, Download, Filter } from 'lucide-react';
import { useState } from 'react';

interface Payment {
    id: number;
    receipt_number: string;
    amount: number;
    payment_method: 'cash' | 'gcash' | 'card';
    paid_at: string;
    collector_name: string;
    plate_number: string;
}

interface AgentSummary {
    agent_id: number;
    agent_name: string;
    transaction_count: number;
    total_amount: number;
}

interface Agent {
    id: number;
    name: string;
}

interface ReportsProps {
    payments: Payment[];
    summary: {
        total_cash: number;
        total_gcash: number;
        total_card: number;
        grand_total: number;
        transaction_count: number;
    };
    agentSummary: AgentSummary[];
    agents: Agent[];
    filters: {
        start_date: string;
        end_date: string;
        agent_id?: number;
    };
}

export default function Reports({ payments, summary, agentSummary, agents, filters }: ReportsProps) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [agentId, setAgentId] = useState(filters.agent_id || '');

    const applyFilters = () => {
        router.get('/admin/reports', {
            start_date: startDate,
            end_date: endDate,
            agent_id: agentId || undefined,
        }, { preserveState: true });
    };

    const exportToCSV = () => {
        const headers = ['Receipt', 'Amount', 'Method', 'Date/Time', 'Agent', 'Plate'];
        const rows = payments.map(p => [
            p.receipt_number,
            Number(p.amount || 0).toFixed(2),
            p.payment_method.toUpperCase(),
            p.paid_at,
            p.collector_name,
            p.plate_number,
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });  
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `collections-report-${startDate}-to-${endDate}.csv`;
        a.click();
    };

    return (
        <AdminLayout breadcrumbs={[
            { title: 'Admin Dashboard', href: '/admin/dashboard' },
            { title: 'Reports', href: '/admin/reports' },
        ]}>
            <Head title="Collections Report" />

            <div className="flex h-full flex-1 flex-col gap-4 sm:gap-6 p-3 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Collections Report</h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">View and analyze payment collections</p>
                    </div>
                    <Button onClick={exportToCSV} className="w-full sm:w-auto">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-gray-600" />
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Filters</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <div>
                            <Label htmlFor="agent_id" className="text-sm">Agent (Optional)</Label>
                            <select
                                id="agent_id"
                                value={agentId}
                                onChange={(e) => setAgentId(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm"
                            >
                                <option value="">All Agents</option>
                                {agents.map(agent => (
                                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <Button onClick={applyFilters} className="w-full">Apply Filters</Button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    <SummaryCard
                        title="Total Cash"
                        value={`₱${summary.total_cash.toFixed(2)}`}
                        icon={<Banknote className="h-5 w-5 sm:h-6 sm:w-6" />}
                        color="green"
                    />
                    <SummaryCard
                        title="Total GCash"
                        value={`₱${summary.total_gcash.toFixed(2)}`}
                        icon={<Wallet className="h-5 w-5 sm:h-6 sm:w-6" />}
                        color="blue"
                    />
                    <SummaryCard
                        title="Total Card"
                        value={`₱${summary.total_card.toFixed(2)}`}
                        icon={<CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />}
                        color="purple"
                    />
                    <SummaryCard
                        title="Grand Total"
                        value={`₱${summary.grand_total.toFixed(2)}`}
                        icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />}
                        color="yellow"
                    />
                    <SummaryCard
                        title="Transactions"
                        value={summary.transaction_count.toString()}
                        icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6" />}
                        color="blue"
                    />
                </div>

                {/* Agent Summary */}
                {agentSummary.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-4 sm:p-6 border-b border-gray-200">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Collections by Agent</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transactions</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {agentSummary.map((agent) => (
                                        <tr key={agent.agent_id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{agent.agent_name}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-600">{agent.transaction_count}</td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                                                ₱{Number(agent.total_amount || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Payment Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Payment Details</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plate</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {payments.length > 0 ? (
                                    payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-mono text-gray-900">{payment.receipt_number}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">{payment.plate_number}</td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                                                ₱{Number(payment.amount || 0).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <PaymentMethodBadge method={payment.payment_method} />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{payment.collector_name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
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
                                        <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                                            No payments found for selected period
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

function SummaryCard({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: 'green' | 'blue' | 'purple' | 'yellow';
}) {
    const colorClasses = {
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        yellow: 'bg-yellow-100 text-yellow-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className={`inline-flex p-2 sm:p-3 rounded-lg ${colorClasses[color]} mb-2 sm:mb-3`}>
                {icon}
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 break-words">{value}</p>
        </div>
    );
}

function PaymentMethodBadge({ method }: { method: 'cash' | 'gcash' | 'card' }) {
    const badgeClasses = {
        cash: 'bg-green-100 text-green-700',
        gcash: 'bg-blue-100 text-blue-700',
        card: 'bg-purple-100 text-purple-700',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClasses[method]}`}>
            {method.toUpperCase()}
        </span>
    );
}
