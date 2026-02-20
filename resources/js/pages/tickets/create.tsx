import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { Head, router, useForm } from '@inertiajs/react';
import { Camera, Car, Clock, DollarSign, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface RateSetting {
    id: number;
    rate_type: 'hourly' | 'flat_rate' | 'overnight';
    price: number;
    duration_minutes: number | null;
    description: string;
}

interface NewTicketProps {
    rateSettings: RateSetting[];
    parkingZones: string[];
}

export default function NewTicket({ rateSettings, parkingZones }: NewTicketProps) {
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    
    // Use backend data if available, otherwise mock data
    const mockRates: RateSetting[] = rateSettings && rateSettings.length > 0 ? rateSettings.map(rate => ({
        ...rate,
        price: Number(rate.price) // Ensure price is a number
    })) : [
        { id: 1, rate_type: 'hourly', price: 40, duration_minutes: null, description: 'Open hours - ₱40 per hour' },
        { id: 2, rate_type: 'flat_rate', price: 50, duration_minutes: 180, description: 'Flat rate - ₱50 for 3 hours' },
        { id: 3, rate_type: 'overnight', price: 100, duration_minutes: 720, description: 'Overnight - ₱100 for 12 hours' },
    ];

    const zones = parkingZones && parkingZones.length > 0 ? parkingZones : ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'];

    const { data, setData, post, processing, errors } = useForm({
        plate_number: '',
        parking_zone: '',
        rate_type: 'hourly' as 'hourly' | 'flat_rate' | 'overnight',
        photo: null as File | null,
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Hourly: Save as active (no payment upfront, pay on exit)
        // Flat/Overnight: Save as pending_payment (must pay before entry)
        post('/tickets', {
            forceFormData: true,
            onSuccess: () => {
                // Backend handles redirect
            },
        });
    };

    const selectedRate = mockRates.find(r => r.rate_type === data.rate_type);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'New Ticket', href: '/tickets/create' },
        ]}>
            <Head title="New Ticket" />
            
            <div className="w-full px-3 sm:px-6 py-3 sm:py-6">
                {/* Header */}
                <div className="bg-blue-600 text-white rounded-t-2xl p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={() => router.visit('/dashboard')}
                            className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                        <div className="bg-white/20 p-2 sm:p-3 rounded-lg">
                            <Car className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold">New Ticket</h1>
                            <p className="text-sm sm:text-base text-blue-100">Create a parking ticket</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                        {/* Plate Number */}
                        <div>
                            <Label htmlFor="plate_number" className="text-sm sm:text-base font-semibold">
                                Plate Number
                            </Label>
                            <Input
                                id="plate_number"
                                type="text"
                                value={data.plate_number}
                                onChange={(e) => setData('plate_number', e.target.value.toUpperCase())}
                                placeholder="ABC-1234"
                                className="mt-2 text-base sm:text-lg"
                                required
                            />
                            <InputError message={errors.plate_number} />
                        </div>

                        {/* Photo Upload (Optional) */}
                        <div>
                            <Label htmlFor="photo" className="text-sm sm:text-base font-semibold">
                                Scan Plate
                            </Label>
                            <div className="mt-2">
                                {photoPreview ? (
                                    <div className="relative">
                                        <img
                                            src={photoPreview}
                                            alt="Plate preview"
                                            className="w-full h-40 sm:h-48 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPhotoPreview(null);
                                                setData('photo', null);
                                            }}
                                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-40 sm:h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-2" />
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-4 text-center">
                                            Click to upload plate photo (any size)
                                        </span>
                                        <input
                                            id="photo"
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                            <InputError message={errors.photo} />
                        </div>

                        {/* Parking Zone */}
                        <div>
                            <Label htmlFor="parking_zone" className="text-sm sm:text-base font-semibold">
                                Parking Zone / Area
                            </Label>
                            <Input
                                id="parking_zone"
                                type="text"
                                value={data.parking_zone}
                                onChange={(e) => setData('parking_zone', e.target.value)}
                                placeholder="Enter parking zone (e.g., Zone 1, North Lot, etc.)"
                                className="mt-2 text-base sm:text-lg py-2 sm:py-3"
                            />
                            <InputError message={errors.parking_zone} />
                        </div>

                        {/* Rate Type Selection */}
                        <div>
                            <Label className="text-sm sm:text-base font-semibold">Rate Type</Label>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                                {mockRates.map((rate) => (
                                    <button
                                        key={rate.id}
                                        type="button"
                                        onClick={() => setData('rate_type', rate.rate_type)}
                                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                                            data.rate_type === rate.rate_type
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${
                                                data.rate_type === rate.rate_type
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}>
                                                {rate.rate_type === 'hourly' ? 'Hourly' : 
                                                 rate.rate_type === 'flat_rate' ? 'Flat' : 'Night'}
                                            </span>
                                            {data.rate_type === rate.rate_type && (
                                                <div className="h-5 w-5 sm:h-6 sm:w-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <div className="h-2 w-2 bg-white rounded-full" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
                                                ₱{rate.price.toFixed(2)}
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {rate.description}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <InputError message={errors.rate_type} />
                        </div>

                        {/* Price Preview */}
                        {selectedRate && (
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            {selectedRate.rate_type === 'hourly' 
                                                ? 'Pay on exit - calculated by time'
                                                : 'Pay now - fixed price'}
                                        </p>
                                        <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1 break-words">
                                            ₱{selectedRate.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="bg-blue-600 p-3 sm:p-4 rounded-full flex-shrink-0">
                                        {selectedRate.rate_type === 'hourly' ? (
                                            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                        ) : (
                                            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 md:px-8 py-4 sm:py-6 rounded-b-2xl flex gap-3 sm:gap-4">
                        <button
                            type="button"
                            onClick={() => router.visit('/dashboard')}
                            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm sm:text-base"
                        >
                            Cancel
                        </button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold text-base sm:text-lg py-5 sm:py-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
                        >
                            {processing && <Spinner />}
                            {selectedRate?.rate_type === 'hourly' 
                                ? 'Generate Ticket'
                                : 'Proceed to Payment'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
