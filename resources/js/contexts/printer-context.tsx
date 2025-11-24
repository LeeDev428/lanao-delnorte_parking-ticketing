import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { printerService } from '@/services/printer.service';
import { Capacitor } from '@capacitor/core';

interface PrinterContextType {
    isNative: boolean;
    isConnected: boolean;
    deviceName: string;
    isConnecting: boolean;
    isPrinting: boolean;
    error: string | null;
    connect: () => Promise<void>;
    connectToSaved: () => Promise<void>;
    print: (payment: any) => Promise<void>;
    testPrint: () => Promise<void>;
    disconnect: () => Promise<void>;
    clearError: () => void;
}

const PrinterContext = createContext<PrinterContextType | undefined>(undefined);

export function PrinterProvider({ children }: { children: ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const [deviceName, setDeviceName] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isNative = Capacitor.isNativePlatform();

    // Initialize Bluetooth on mount
    useEffect(() => {
        if (isNative) {
            initializeBluetooth();
        }
    }, [isNative]);

    // Auto-connect to saved printer on mount
    useEffect(() => {
        if (isNative && !isConnected) {
            const savedDeviceId = localStorage.getItem('pt210_device_id');
            if (savedDeviceId) {
                console.log('🔄 Auto-connecting to saved printer...');
                connectToSaved();
            }
        }
    }, [isNative]);

    const initializeBluetooth = async () => {
        try {
            await printerService.initialize();
            console.log('✅ Bluetooth initialized globally');
        } catch (err) {
            console.error('❌ Bluetooth initialization failed:', err);
            setError('Bluetooth not available on this device');
        }
    };

    const connect = async (): Promise<void> => {
        setIsConnecting(true);
        setError(null);

        try {
            await printerService.scanAndConnect();
            const name = printerService.getDeviceName();
            
            setIsConnected(true);
            setDeviceName(name);
            setIsConnecting(false);
            
            console.log('✅ Connected globally to:', name);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Connection failed';
            setIsConnected(false);
            setIsConnecting(false);
            setError(errorMessage);
            throw error;
        }
    };

    const connectToSaved = async (): Promise<void> => {
        const savedDeviceId = localStorage.getItem('pt210_device_id');
        if (!savedDeviceId) {
            console.log('⚠️ No saved printer found');
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            await printerService.connectToDevice(savedDeviceId);
            const name = printerService.getDeviceName();
            
            setIsConnected(true);
            setDeviceName(name);
            setIsConnecting(false);
            
            console.log('✅ Auto-connected to saved printer:', name);
        } catch (error) {
            console.error('❌ Auto-connect failed:', error);
            setIsConnected(false);
            setIsConnecting(false);
            // Don't show error for auto-connect failures
        }
    };

    const print = async (payment: any): Promise<void> => {
        if (!isConnected) {
            throw new Error('Printer not connected. Please connect in Settings.');
        }

        setIsPrinting(true);
        setError(null);

        try {
            await printerService.printReceipt(payment);
            setIsPrinting(false);
            console.log('✅ Printed successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Print failed';
            setIsPrinting(false);
            setError(errorMessage);
            throw error;
        }
    };

    const testPrint = async (): Promise<void> => {
        if (!isConnected) {
            throw new Error('Printer not connected');
        }

        setIsPrinting(true);
        setError(null);

        try {
            await printerService.testPrint();
            setIsPrinting(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Test print failed';
            setIsPrinting(false);
            setError(errorMessage);
            throw error;
        }
    };

    const disconnect = async (): Promise<void> => {
        try {
            await printerService.disconnect();
            setIsConnected(false);
            setDeviceName('');
            setError(null);
            localStorage.removeItem('pt210_device_id');
            console.log('✅ Disconnected globally');
        } catch (error) {
            console.error('❌ Disconnect error:', error);
        }
    };

    const clearError = () => {
        setError(null);
    };

    return (
        <PrinterContext.Provider
            value={{
                isNative,
                isConnected,
                deviceName,
                isConnecting,
                isPrinting,
                error,
                connect,
                connectToSaved,
                print,
                testPrint,
                disconnect,
                clearError,
            }}
        >
            {children}
        </PrinterContext.Provider>
    );
}

export function usePrinterContext() {
    const context = useContext(PrinterContext);
    if (context === undefined) {
        throw new Error('usePrinterContext must be used within a PrinterProvider');
    }
    return context;
}
