import { BrowserQRCodeReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';

export class QrService {
    private codeReader: BrowserQRCodeReader;
    private videoStream: MediaStream | null = null;

    constructor() {
        this.codeReader = new BrowserQRCodeReader();
    }

    async startCamera(
        videoElement: HTMLVideoElement,
        onSuccess: (text: string) => void,
        onError?: (error: any) => void,
        onException?: (e: any) => void,
        deviceIdOverride?: string
    ) {
        let isProcessing = false;
        try {
            this.videoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: deviceIdOverride ? { exact: deviceIdOverride } : undefined
                }
            });

            videoElement.srcObject = this.videoStream;
            await videoElement.play();

            this.codeReader.decodeFromVideoElement(videoElement, (result, err) => {
                if (result  && !isProcessing) {
                    isProcessing = true;
                    onSuccess(result.getText());
                    this.stopCamera(videoElement);
                }
                if (err && !(err instanceof NotFoundException)) {
                    if (onError) onError(err);
                }
            });
        } catch (e) {
            if (onException) onException(e);
        }
    }

    stopCamera(videoElement: HTMLVideoElement) {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
        videoElement.srcObject = null;
        this.codeReader = new BrowserQRCodeReader(); // limpia el estado interno
    }

    async scanImage(file: File): Promise<string | null> {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async () => {
                try {
                    const result = await this.codeReader.decodeFromImageUrl(reader.result as string);
                    resolve(result.getText());
                } catch (e) {
                    resolve(null); // No se detectó QR
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}
