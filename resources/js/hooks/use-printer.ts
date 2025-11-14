import { useState, useEffect } from 'react';
import { printerService } from '@/services/printer.service';
import { Capacitor } from '@capacitor/core';

export interface PrinterStatus {
    isNative: boolean;
    isConnected: boolean;
    deviceName: string;
    isConnecting: boolean;
    isPrinting: boolean;
    error: string | null;
}

export function usePrinter() {
    const [status, setStatus] = useState<PrinterStatus>({
        isNative: Capacitor.isNativePlatform(),
        isConnected: false,
        deviceName: '',
        isConnecting: false,
        isPrinting: false,
        error: null
    });

    useEffect(() => {
        // Initialize Bluetooth if on native platform
        if (status.isNative) {
            printerService.initialize().catch(err => {
                console.error('Bluetooth initialization failed:', err);
                setStatus(prev => ({
                    ...prev,
                    error: 'Bluetooth not available on this device'
                }));
            });
        }
    }, [status.isNative]);

    /**
     * Connect to Bluetooth printer
     */
    const connect = async (): Promise<void> => {
        setStatus(prev => ({ ...prev, isConnecting: true, error: null }));

        try {
            await printerService.scanAndConnect();
            setStatus(prev => ({
                ...prev,
                isConnected: true,
                isConnecting: false,
                deviceName: printerService.getDeviceName(),
                error: null
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Connection failed';
            setStatus(prev => ({
                ...prev,
                isConnected: false,
                isConnecting: false,
                error: errorMessage
            }));
            throw error;
        }
    };

    /**
     * Print receipt
     */
    const print = async (payment: any): Promise<void> => {
        if (!status.isConnected) {
            throw new Error('Printer not connected. Please connect first.');
        }

        setStatus(prev => ({ ...prev, isPrinting: true, error: null }));

        try {
            await printerService.printReceipt(payment);
            setStatus(prev => ({ ...prev, isPrinting: false, error: null }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Print failed';
            setStatus(prev => ({
                ...prev,
                isPrinting: false,
                error: errorMessage
            }));
            throw error;
        }
    };

    /**
     * Test print
     */
    const testPrint = async (): Promise<void> => {
        if (!status.isConnected) {
            throw new Error('Printer not connected');
        }

        setStatus(prev => ({ ...prev, isPrinting: true, error: null }));

        try {
            await printerService.testPrint();
            setStatus(prev => ({ ...prev, isPrinting: false, error: null }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Test print failed';
            setStatus(prev => ({
                ...prev,
                isPrinting: false,
                error: errorMessage
            }));
            throw error;
        }
    };

    /**
     * Disconnect from printer
     */
    const disconnect = async (): Promise<void> => {
        try {
            await printerService.disconnect();
            setStatus(prev => ({
                ...prev,
                isConnected: false,
                deviceName: '',
                error: null
            }));
        } catch (error) {
            console.error('Disconnect error:', error);
        }
    };

    /**
     * Clear error
     */
    const clearError = () => {
        setStatus(prev => ({ ...prev, error: null }));
    };

    return {
        ...status,
        connect,
        print,
        testPrint,
        disconnect,
        clearError
    };
}
