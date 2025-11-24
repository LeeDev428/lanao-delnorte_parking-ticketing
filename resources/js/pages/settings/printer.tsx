import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import { Bluetooth, Printer, CheckCircle, AlertCircle, Loader2, Wifi } from 'lucide-react';
import { usePrinterContext } from '@/contexts/printer-context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrinterSettings() {
    const printer = usePrinterContext();

    const handleConnect = async () => {
        try {
            await printer.connect();
        } catch (error) {
            console.error('Connection failed:', error);
        }
    };

    const handleTestPrint = async () => {
        try {
            await printer.testPrint();
        } catch (error) {
            console.error('Test print failed:', error);
        }
    };

    const handleDisconnect = async () => {
        try {
            await printer.disconnect();
        } catch (error) {
            console.error('Disconnect failed:', error);
        }
    };

    if (!printer.isNative) {
        return (
            <AppLayout breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Printer Settings', href: '#' },
            ]}>
                <Head title="Printer Settings" />
                <div className="w-full px-3 sm:px-6 py-6">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Bluetooth printer is only available on mobile devices.
                        </AlertDescription>
                    </Alert>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Printer Settings', href: '#' },
        ]}>
            <Head title="Printer Settings" />
            
            <div className="w-full px-3 sm:px-6 py-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        Thermal Printer Settings
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                        Manage your PT-210 Bluetooth thermal printer connection
                    </p>
                </div>

                {/* Status Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bluetooth className="h-5 w-5 text-blue-600" />
                            Connection Status
                        </CardTitle>
                        <CardDescription>
                            Current printer connection status
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Status Display */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                    printer.isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                }`} />
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {printer.isConnected ? 'Connected' : 'Disconnected'}
                                    </p>
                                    {printer.deviceName && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {printer.deviceName}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {printer.isConnected && (
                                <CheckCircle className="h-6 w-6 text-green-500" />
                            )}
                        </div>

                        {/* Error Display */}
                        {printer.error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{printer.error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Connection Info */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Wifi className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    <p className="font-semibold mb-2">How it works:</p>
                                    <ul className="space-y-1 list-disc list-inside">
                                        <li>Connect once, stay connected across all transactions</li>
                                        <li>Auto-reconnects if connection drops (up to 3 attempts)</li>
                                        <li>Keepalive pings every 30 seconds maintain connection</li>
                                        <li>Your printer will be remembered for next time</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {!printer.isConnected ? (
                                <Button
                                    onClick={handleConnect}
                                    disabled={printer.isConnecting}
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                                >
                                    {printer.isConnecting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Scanning for PT-210...
                                        </>
                                    ) : (
                                        <>
                                            <Bluetooth className="h-5 w-5 mr-2" />
                                            Connect to PT-210 Printer
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        onClick={handleTestPrint}
                                        disabled={printer.isPrinting}
                                        className="w-full h-12 bg-green-600 hover:bg-green-700"
                                    >
                                        {printer.isPrinting ? (
                                            <>
                                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                Printing...
                                            </>
                                        ) : (
                                            <>
                                                <Printer className="h-5 w-5 mr-2" />
                                                Test Print
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleDisconnect}
                                        variant="outline"
                                        className="w-full h-12"
                                    >
                                        <Bluetooth className="h-5 w-5 mr-2" />
                                        Disconnect Printer
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Instructions Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Setup Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold text-xs">
                                    1
                                </span>
                                <span>Turn on your PT-210 thermal printer</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold text-xs">
                                    2
                                </span>
                                <span>Make sure the printer is in pairing mode (blue LED blinking)</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold text-xs">
                                    3
                                </span>
                                <span>Click "Connect to PT-210 Printer" and select your device</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold text-xs">
                                    4
                                </span>
                                <span>Once connected, you can process payments without reconnecting</span>
                            </li>
                        </ol>
                    </CardContent>
                </Card>

                {/* Success Message */}
                {printer.isConnected && (
                    <Alert className="bg-green-50 border-green-200 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            ✅ Printer connected! Your printer will stay connected for all transactions. 
                            Receipts will print automatically after payment.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </AppLayout>
    );
}
