import { BleClient, BleDevice, numbersToDataView, numberToUUID } from '@capacitor-community/bluetooth-le';
import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder';

/**
 * Thermal Printer Service for PT-210 Bluetooth Printer
 * Supports ESC/POS commands for 58mm thermal receipt printing
 */
export class ThermalPrinterService {
    private device: BleDevice | null = null;
    private isConnected: boolean = false;
    private keepAliveInterval: NodeJS.Timeout | null = null;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 3;
    
    // Common UUIDs for Bluetooth thermal printers (PT-210 compatible)
    private readonly SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb';
    private readonly WRITE_UUID = '00002af1-0000-1000-8000-00805f9b34fb';
    
    /**
     * Initialize Bluetooth
     */
    async initialize(): Promise<void> {
        try {
            await BleClient.initialize({
                androidNeverForLocation: true
            });
            console.log('✅ Bluetooth initialized');
        } catch (error) {
            console.error('❌ Bluetooth initialization failed:', error);
            throw new Error('Failed to initialize Bluetooth');
        }
    }

    /**
     * Scan and connect to PT-210 printer
     */
    async scanAndConnect(): Promise<void> {
        try {
            console.log('🔍 Scanning for Bluetooth devices...');
            
            // Start scanning for devices
            await BleClient.requestLEScan(
                {
                    allowDuplicates: false,
                },
                (result) => {
                    console.log('Found device:', result.device.name || result.device.deviceId);
                }
            );

            // Wait 3 seconds for scanning
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Stop scanning
            await BleClient.stopLEScan();
            console.log('🛑 Scan stopped');

            // Now show device picker
            this.device = await BleClient.requestDevice({
                optionalServices: [
                    this.SERVICE_UUID,
                    '000018f0-0000-1000-8000-00805f9b34fb',
                    '49535343-fe7d-4ae5-8fa9-9fafd205e455',
                    '0000fff0-0000-1000-8000-00805f9b34fb' // Another common printer service
                ]
            });

            console.log('📱 Selected device:', this.device.name || this.device.deviceId);

            // Save device ID for auto-reconnect
            localStorage.setItem('pt210_device_id', this.device.deviceId);

            // Connect to the device
            await BleClient.connect(this.device.deviceId, (deviceId) => {
                console.log('🔌 Disconnected from:', deviceId);
                this.isConnected = false;
                this.stopKeepAlive();
                // Attempt auto-reconnect
                this.attemptReconnect();
            });

            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('✅ Connected to printer:', this.device.name || this.device.deviceId);
            
            // Start keepalive to maintain connection
            this.startKeepAlive();

        } catch (error: any) {
            console.error('❌ Connection failed:', error);
            this.isConnected = false;
            this.device = null;
            
            // Better error messages
            if (error.message?.includes('cancelled')) {
                throw new Error('Connection cancelled. Please try again.');
            } else if (error.message?.includes('permission')) {
                throw new Error('Bluetooth permission denied. Please enable Bluetooth permissions in Settings.');
            } else {
                throw new Error('Failed to connect. Turn on printer and put in pairing mode (blue LED blinking).');
            }
        }
    }

    /**
     * Connect to a specific device by ID (for auto-reconnect)
     */
    async connectToDevice(deviceId: string): Promise<void> {
        try {
            console.log('🔄 Connecting to saved device:', deviceId);

            // Try to connect directly to the saved device
            await BleClient.connect(deviceId, (disconnectedDeviceId) => {
                console.log('🔌 Disconnected from:', disconnectedDeviceId);
                this.isConnected = false;
                this.stopKeepAlive();
                this.attemptReconnect();
            });

            this.device = { deviceId, name: 'PT-210' };
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('✅ Connected to saved printer');
            
            // Start keepalive
            this.startKeepAlive();

        } catch (error: any) {
            console.error('❌ Auto-connect failed:', error);
            this.isConnected = false;
            this.device = null;
            localStorage.removeItem('pt210_device_id');
            throw error;
        }
    }

    /**
     * Print parking receipt
     */
    async printReceipt(payment: any): Promise<void> {
        if (!this.device || !this.isConnected) {
            throw new Error('Printer not connected. Please connect first.');
        }

        try {
            console.log('🖨️ Printing receipt...');

            // Build receipt using ESC/POS encoder
            const encoder = new ReceiptPrinterEncoder({
                language: 'esc-pos',
                columns: 32 // 58mm paper = ~32 characters
            });

            const ticket = payment.ticket;
            const entryTime = new Date(ticket.entry_time);
            const exitTime = ticket.exit_time ? new Date(ticket.exit_time) : new Date();
            const duration = ticket.duration_minutes || 0;
            
            const receiptData = encoder
                .initialize()
                .align('center')
                .bold(true)
                .size('normal')
                .line('================================')
                .line('LANAO DEL NORTE')
                .line('PARKING TICKETING SYSTEM')
                .line('================================')
                .newline()
                .bold(false)
                .align('left')
                .line(`Receipt No: ${payment.receipt_number}`)
                .line(`Ticket No : ${ticket.ticket_id}`)
                .line('--------------------------------')
                .line(`Plate No  : ${ticket.plate_number || 'N/A'}`)
                .line(`Zone      : ${ticket.parking_zone}`)
                .line(`Rate Type : ${ticket.rate_type.toUpperCase()}`)
                .line('--------------------------------')
                .line(`Entry Time: ${entryTime.toLocaleString('en-PH', { 
                    month: 'short', day: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true 
                })}`)
                .line(`Exit Time : ${exitTime.toLocaleString('en-PH', { 
                    month: 'short', day: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true 
                })}`)
                .line(`Duration  : ${Math.floor(duration / 60)}h ${duration % 60}m`)
                .line('--------------------------------')
                .align('right')
                .bold(true)
                .size('normal')
                .line(`AMOUNT: ₱${parseFloat(payment.amount).toFixed(2)}`)
                .bold(false)
                .size('normal')
                .align('left')
                .line('--------------------------------')
                .line(`Payment   : ${payment.payment_method.toUpperCase()}`)
                .line(`Collected : ${payment.collector.name}`)
                .line(`Date/Time : ${new Date(payment.paid_at).toLocaleString('en-PH')}`)
                .newline()
                .align('center')
                .qrcode(payment.receipt_number, 1, 4, 'h')
                .newline()
                .line('Scan QR for verification')
                .newline()
                .line('Thank you!')
                .line('Drive safely!')
                .newline()
                .newline()
                .newline()
                .cut('partial')
                .encode();

            // Convert to DataView for BLE write
            const dataView = new DataView(receiptData.buffer);

            // Write to printer (chunk if needed for large receipts)
            const chunkSize = 512; // Safe chunk size for BLE
            for (let i = 0; i < receiptData.length; i += chunkSize) {
                const chunk = receiptData.slice(i, Math.min(i + chunkSize, receiptData.length));
                const chunkView = new DataView(chunk.buffer);
                
                await BleClient.write(
                    this.device.deviceId,
                    this.SERVICE_UUID,
                    this.WRITE_UUID,
                    chunkView
                );
                
                // Small delay between chunks
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            console.log('✅ Receipt printed successfully!');

        } catch (error) {
            console.error('❌ Print failed:', error);
            throw new Error('Failed to print receipt. Please try again.');
        }
    }

    /**
     * Check if printer is connected
     */
    isDeviceConnected(): boolean {
        return this.isConnected && this.device !== null;
    }

    /**
     * Get connected device name
     */
    getDeviceName(): string {
        return this.device?.name || this.device?.deviceId || 'Unknown';
    }

    /**
     * Start keepalive ping to maintain connection
     */
    private startKeepAlive(): void {
        // Stop any existing keepalive
        this.stopKeepAlive();
        
        // Ping every 30 seconds to keep connection alive
        this.keepAliveInterval = setInterval(async () => {
            if (this.isConnected && this.device) {
                try {
                    // Send empty status check command
                    const encoder = new ReceiptPrinterEncoder({
                        language: 'esc-pos',
                        columns: 32
                    });
                    const pingData = encoder.initialize().encode();
                    const dataView = new DataView(pingData.buffer);
                    
                    await BleClient.write(
                        this.device.deviceId,
                        this.SERVICE_UUID,
                        this.WRITE_UUID,
                        dataView
                    );
                    console.log('📡 Keepalive ping sent');
                } catch (error) {
                    console.error('❌ Keepalive failed:', error);
                    this.isConnected = false;
                    this.stopKeepAlive();
                    this.attemptReconnect();
                }
            }
        }, 30000); // 30 seconds
        
        console.log('🔄 Keepalive started');
    }

    /**
     * Stop keepalive
     */
    private stopKeepAlive(): void {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
            this.keepAliveInterval = null;
            console.log('🛑 Keepalive stopped');
        }
    }

    /**
     * Attempt to reconnect automatically
     */
    private async attemptReconnect(): Promise<void> {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
            return;
        }

        if (!this.device) {
            console.log('⚠️ No device to reconnect to');
            return;
        }

        this.reconnectAttempts++;
        console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before reconnecting
            
            await BleClient.connect(this.device.deviceId, (deviceId) => {
                console.log('🔌 Disconnected from:', deviceId);
                this.isConnected = false;
                this.stopKeepAlive();
                this.attemptReconnect();
            });

            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('✅ Reconnected successfully!');
            this.startKeepAlive();
            
        } catch (error) {
            console.error(`❌ Reconnect attempt ${this.reconnectAttempts} failed:`, error);
            // Try again if under max attempts
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                await this.attemptReconnect();
            }
        }
    }

    /**
     * Disconnect from printer
     */
    async disconnect(): Promise<void> {
        // Stop keepalive first
        this.stopKeepAlive();
        
        if (this.device) {
            try {
                await BleClient.disconnect(this.device.deviceId);
                console.log('✅ Disconnected from printer');
            } catch (error) {
                console.error('❌ Disconnect error:', error);
            } finally {
                this.isConnected = false;
                this.device = null;
                this.reconnectAttempts = 0;
            }
        }
    }

    /**
     * Test print (for testing connection)
     */
    async testPrint(): Promise<void> {
        if (!this.device || !this.isConnected) {
            throw new Error('Printer not connected');
        }

        const encoder = new ReceiptPrinterEncoder({
            language: 'esc-pos',
            columns: 32
        });

        const testData = encoder
            .initialize()
            .align('center')
            .bold(true)
            .line('TEST PRINT')
            .line('PT-210 Printer')
            .bold(false)
            .newline()
            .line('Connection successful!')
            .newline()
            .newline()
            .cut('partial')
            .encode();

        const dataView = new DataView(testData.buffer);
        
        await BleClient.write(
            this.device.deviceId,
            this.SERVICE_UUID,
            this.WRITE_UUID,
            dataView
        );

        console.log('✅ Test print sent');
    }
}

// Export singleton instance
export const printerService = new ThermalPrinterService();
