import AdminLayout from '@/layouts/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Clock, DollarSign, Edit, Save, Moon, Plus, Trash2, X, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface RateSetting {
    id: number;
    rate_type: 'hourly' | 'flat_rate' | 'overnight';
    price: number;
    duration_minutes: number | null;
    description: string;
    is_active: boolean;
}

interface RateSettingsProps {
    rateSettings: RateSetting[];
}

export default function RateSettings({ rateSettings }: RateSettingsProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { props } = usePage();
    const successMessage = props.success as string | undefined;

    useEffect(() => {
        if (successMessage) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const getRateIcon = (rateType: string) => {
        switch (rateType) {
            case 'hourly': return Clock;
            case 'flat_rate': return DollarSign;
            case 'overnight': return Moon;
            default: return Clock;
        }
    };

    const getRateColor = (rateType: string) => {
        switch (rateType) {
            case 'hourly': return 'bg-blue-500';
            case 'flat_rate': return 'bg-green-500';
            case 'overnight': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <AdminLayout>
            <Head title="Rate Settings - Admin" />
            
            <div className="max-w-7xl mx-auto p-6">
                {/* Success Message */}
                {showSuccess && successMessage && (
                    <div className="mb-6 bg-green-500 text-white rounded-lg p-4 flex items-center gap-3 animate-in slide-in-from-top">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{successMessage}</span>
                    </div>
                )}

                {/* Header */}
                <div className="bg-blue-600 text-white rounded-t-2xl p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Rate Settings</h1>
                            <p className="text-blue-100 mt-1">Manage parking rates and durations</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Rate
                            </Button>
                            <div className="bg-white/20 p-3 rounded-lg">
                                <DollarSign className="h-8 w-8" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Form Modal */}
                {showCreateForm && (
                    <CreateRateForm onClose={() => setShowCreateForm(false)} />
                )}

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                        <strong>Note:</strong> These rates will be used by agents when creating parking tickets for customers. 
                        Changes here will apply to all new tickets immediately.
                    </p>
                </div>

                {/* Rate Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {rateSettings.map((rate) => {
                        const Icon = getRateIcon(rate.rate_type);
                        const isEditing = editingId === rate.id;

                        return (
                            <RateCard
                                key={rate.id}
                                rate={rate}
                                icon={Icon}
                                color={getRateColor(rate.rate_type)}
                                isEditing={isEditing}
                                onEdit={() => setEditingId(rate.id)}
                                onCancel={() => setEditingId(null)}
                                onSave={() => setEditingId(null)}
                            />
                        );
                    })}
                </div>

                {/* Usage Guide */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Rate Types Explained</h2>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <strong className="text-gray-900 dark:text-white">Hourly:</strong> Pay on exit. 
                                Charges per hour (rounds up: 1hr 1min = 2hrs charge). Duration is not fixed.
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <DollarSign className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <strong className="text-gray-900 dark:text-white">Flat Rate:</strong> Pay upfront. 
                                Fixed price for a specific duration (e.g., ₱50 for 3 hours).
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Moon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <strong className="text-gray-900 dark:text-white">Overnight:</strong> Pay upfront. 
                                Fixed price for overnight parking (e.g., ₱100 for 12 hours).
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

// Create Rate Form Component
interface CreateRateFormProps {
    onClose: () => void;
}

function CreateRateForm({ onClose }: CreateRateFormProps) {
    const { data, setData, post, processing, errors } = useForm({
        rate_type: 'hourly' as 'hourly' | 'flat_rate' | 'overnight',
        price: 0,
        duration_minutes: 0,
        description: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/rate-settings', {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-blue-600 text-white p-6 flex items-center justify-between rounded-t-xl">
                    <h2 className="text-2xl font-bold">Add New Rate</h2>
                    <button
                        onClick={onClose}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <Label htmlFor="rate_type">Rate Type *</Label>
                        <select
                            id="rate_type"
                            value={data.rate_type}
                            onChange={(e) => setData('rate_type', e.target.value as any)}
                            className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            required
                        >
                            <option value="hourly">Hourly</option>
                            <option value="flat_rate">Flat Rate</option>
                            <option value="overnight">Overnight</option>
                        </select>
                        {errors.rate_type && <p className="text-red-500 text-sm mt-1">{errors.rate_type}</p>}
                    </div>

                    <div>
                        <Label htmlFor="price">Price (₱) *</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={data.price}
                            onChange={(e) => setData('price', parseFloat(e.target.value))}
                            className="mt-1"
                            required
                        />
                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                    </div>

                    {data.rate_type !== 'hourly' && (
                        <div>
                            <Label htmlFor="duration">Duration (hours) *</Label>
                            <Input
                                id="duration"
                                type="number"
                                step="0.5"
                                value={data.duration_minutes / 60}
                                onChange={(e) => setData('duration_minutes', parseFloat(e.target.value) * 60)}
                                className="mt-1"
                                required
                            />
                            {errors.duration_minutes && <p className="text-red-500 text-sm mt-1">{errors.duration_minutes}</p>}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="description">Description *</Label>
                        <Input
                            id="description"
                            type="text"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1"
                            placeholder="e.g., Standard hourly rate"
                            required
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="is_active"
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                        />
                        <Label htmlFor="is_active">Active</Label>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Rate'}
                        </Button>
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface RateCardProps {
    rate: RateSetting;
    icon: any;
    color: string;
    isEditing: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
}

function RateCard({ rate, icon: Icon, color, isEditing, onEdit, onCancel, onSave }: RateCardProps) {
    const { data, setData, patch, processing, delete: destroy } = useForm({
        price: rate.price,
        duration_minutes: rate.duration_minutes || 0,
        description: rate.description,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/admin/rate-settings/${rate.id}`, {
            onSuccess: () => {
                onSave();
            },
        });
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete this rate setting: ${getRateTitle(rate.rate_type)}?`)) {
            destroy(`/admin/rate-settings/${rate.id}`, {
                onSuccess: () => {
                    router.reload();
                },
            });
        }
    };

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return 'Per hour';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
    };

    const getRateTitle = (rateType: string) => {
        switch (rateType) {
            case 'hourly': return 'Hourly Rate';
            case 'flat_rate': return 'Flat Rate';
            case 'overnight': return 'Overnight Rate';
            default: return rateType;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className={`${color} p-4 flex items-center justify-between text-white`}>
                <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6" />
                    <h3 className="font-bold text-lg">{getRateTitle(rate.rate_type)}</h3>
                </div>
                {!isEditing && (
                    <button
                        onClick={onEdit}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor={`price-${rate.id}`}>Price (₱)</Label>
                            <Input
                                id={`price-${rate.id}`}
                                type="number"
                                step="0.01"
                                value={data.price}
                                onChange={(e) => setData('price', parseFloat(e.target.value))}
                                className="mt-1"
                                required
                            />
                        </div>

                        {rate.rate_type !== 'hourly' && (
                            <div>
                                <Label htmlFor={`duration-${rate.id}`}>Duration (hours)</Label>
                                <Input
                                    id={`duration-${rate.id}`}
                                    type="number"
                                    value={data.duration_minutes / 60}
                                    onChange={(e) => setData('duration_minutes', parseFloat(e.target.value) * 60)}
                                    className="mt-1"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <Label htmlFor={`description-${rate.id}`}>Description</Label>
                            <Input
                                id={`description-${rate.id}`}
                                type="text"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1"
                                required
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save
                            </Button>
                            <Button
                                type="button"
                                onClick={onCancel}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                ₱ {Number(rate.price).toFixed(2)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatDuration(rate.duration_minutes)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{rate.description}</p>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                rate.is_active 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                                {rate.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <button
                                onClick={handleDelete}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Delete rate"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
