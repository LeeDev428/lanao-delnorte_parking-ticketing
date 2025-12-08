import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SystemSettingsProps {
    settings: {
        system_name: string;
        system_short_name: string;
    };
}

export default function SystemSettings({ settings }: SystemSettingsProps) {
    const [systemName, setSystemName] = useState(settings.system_name || 'Auto Ticketing System');
    const [shortName, setShortName] = useState(settings.system_short_name || 'ATS');
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        router.post('/admin/system-settings', {
            system_name: systemName,
            system_short_name: shortName,
        }, {
            onSuccess: () => {
                setSaving(false);
            },
            onError: () => {
                setSaving(false);
            },
        });
    };

    return (
        <AdminLayout title="System Settings">
            <Head title="System Settings" />

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>System Information</CardTitle>
                        <CardDescription>
                            Configure your parking system's display name and branding
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="system_name">System Name</Label>
                            <Input
                                id="system_name"
                                value={systemName}
                                onChange={(e) => setSystemName(e.target.value)}
                                placeholder="Auto Ticketing System"
                                className="mt-1"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                This name will appear on all pages, receipts, and documents
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="short_name">Short Name</Label>
                            <Input
                                id="short_name"
                                value={shortName}
                                onChange={(e) => setShortName(e.target.value)}
                                placeholder="ATS"
                                className="mt-1"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Abbreviated name for compact displays
                            </p>
                        </div>

                        <div className="pt-4">
                            <Button 
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full sm:w-auto"
                            >
                                {saving ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
