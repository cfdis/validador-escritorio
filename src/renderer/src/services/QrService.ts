import { BrowserQRCodeReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
import { PdfService } from './PdfService';
import { QrParams } from '../utils/Types';

export class QrService {
    private codeReader: BrowserQRCodeReader;
    private videoStream: MediaStream | null = null;

    constructor(
        private pdfS: PdfService,
    ) {
        this.codeReader = new BrowserQRCodeReader();
    }

    public async startCamera(
        videoElement: HTMLVideoElement,
        onSuccess: (scanResult: QrParams | null) => void,
        onError?: (error: any) => void,
        onException?: (e: any) => void,
        deviceIdOverride?: string
    ) {
        let isCooldown = false;
        try {
            this.videoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: deviceIdOverride ? { exact: deviceIdOverride } : undefined,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            videoElement.srcObject = this.videoStream;
            await videoElement.play();

            this.codeReader.decodeFromVideoElement(videoElement, (result, err) => {
                if (isCooldown) return; // Si está en cooldown, no procesar el resultado
                if (result) {
                    const scanResult = this.processResult(result.getText());
                    if (scanResult) {
                        onSuccess(scanResult);
                        isCooldown = true;
                        setTimeout(() => {
                            isCooldown = false;
                        }, 2000); // cooldown de 2 segundos para evitar detectar el mismo qr repetidamente
                    }
                }
                if (err && !(err instanceof NotFoundException)) {
                    if (onError) onError(err);
                }
            });
        } catch (e) {
            if (onException) onException(e);
        }
    }

    public stopCamera(videoElement: HTMLVideoElement) {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
        videoElement.srcObject = null;
        this.codeReader = new BrowserQRCodeReader(); // limpia el estado interno
    }

    public async scanImage(file: File): Promise<QrParams | null> {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async () => {
                try {
                    const result = await this.codeReader.decodeFromImageUrl(reader.result as string);
                    resolve(this.processResult(result.getText()));
                } catch (e) {
                    resolve(null); // No se detectó QR
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    public scanCanvas(canvas: HTMLCanvasElement): QrParams | null {
        try {
            const result = this.codeReader.decodeFromCanvas(canvas);
            return this.processResult(result.getText());
        } catch {
            return null;
        }
    }

    public async scanFromPdf(file: File): Promise<QrParams | null> {
        const canvases = await this.pdfS.getAsImages(file);
        for (const canvas of canvases) {
            const qr = this.scanCanvas(canvas);
            if (qr) return qr;
        }
        return null;
    }

    private processResult(raw: string): QrParams | null {
        if (!raw || typeof raw !== 'string') {
            return null;
        }
        const isValidUrl = raw.startsWith('https://verificacfdi.facturaelectronica.sat.gob.mx/');

        if (!isValidUrl) {
            return null;
        }

        try {
            const url = new URL(raw);
            const params = new URLSearchParams(url.search);

            const id = params.get('id');
            const re = params.get('re');
            const rr = params.get('rr');
            const tt = params.get('tt');
            const fe = params.get('fe');

            if (!id || !re || !rr || !tt || !fe) {
                return null;
            }

            return {
                'id': id,
                're': re,
                'rr': rr,
                'tt': tt,
                'fe': fe
            }

        } catch (error) {
            return null;
        }
    }
}
