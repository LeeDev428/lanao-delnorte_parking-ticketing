declare module '@point-of-sale/receipt-printer-encoder' {
    interface EncoderOptions {
        language?: string;
        columns?: number;
    }

    class ReceiptPrinterEncoder {
        constructor(options?: EncoderOptions);
        initialize(): this;
        align(alignment: 'left' | 'center' | 'right'): this;
        bold(enabled: boolean): this;
        size(size: 'small' | 'normal'): this;
        line(text: string): this;
        newline(): this;
        qrcode(data: string, model?: number, size?: number, errorlevel?: 'l' | 'm' | 'q' | 'h'): this;
        cut(type?: 'full' | 'partial'): this;
        encode(): Uint8Array;
    }

    export default ReceiptPrinterEncoder;
}
