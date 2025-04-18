import $ from 'jquery';
import { renderQrTable } from '../utils/qrScanShared';
import type { View } from '../interfaces/View';
import { QrService } from '../services/QrService';
import { ToastService } from '../services/ToastService';

export class QrScanCameraView implements View {
    private selectedDeviceId: string | null = null;
    private qrResults: Record<string, string>[] = [];
    private videoElement: HTMLVideoElement;
    private cameraSelect: any;

    constructor(
        private qr: QrService,
        private ss: ToastService,
    ) {
        this.videoElement = $('#videoElement')[0] as HTMLVideoElement;
        this.cameraSelect = $('#cameraSelect');
    }

    public init(): void {
        this.populateCameras();
        this.bindEvents();
    }

    private populateCameras(): void {
        navigator.mediaDevices.enumerateDevices().then(devices => {
            const videoDevices = devices.filter(d => d.kind === 'videoinput');
            videoDevices.forEach(device => {
                this.cameraSelect.append(
                    $('<option>').val(device.deviceId).text(device.label || `Cámara ${this.cameraSelect.children().length}`)
                );
            });
        });
    }

    private bindEvents(): void {
        $('#startCameraBtn').on('click', async (e) => {
            e.preventDefault();
            this.selectedDeviceId = this.cameraSelect.val() as string;

            if (!this.selectedDeviceId) {
                alert('Selecciona una cámara primero.');
                return;
            }

            $('#stopCameraBtn').removeClass('hidden');
            $('#startCameraBtn').addClass('hidden');

            await this.qr.startCamera(this.videoElement, this.onsuccess.bind(this), this.onerror, this.onException, this.selectedDeviceId);
        });

        $('#stopCameraBtn').on('click', (e) => {
            e.preventDefault();
            this.qr.stopCamera(this.videoElement);
            $('#startCameraBtn').removeClass('hidden');
            $('#stopCameraBtn').addClass('hidden');
        });

        $(document).on('click', '.btn-home', (e) => {
            e.preventDefault();
            this.qr.stopCamera(this.videoElement);
        });

        $(document).on('click', '.btn-remove', (e) => {
            const index = parseInt($(e.currentTarget).data('index'), 10);
            if (!isNaN(index)) {
                this.qrResults.splice(index, 1);
                renderQrTable('cameraQrResultContainer', this.qrResults);
            }
        });

        $('#validateQrBtn').on('click', () => {
            console.log('Validando los siguientes QR:', this.qrResults);
            alert(`Aún no implementado, pero tenemos ${this.qrResults.length} CFDI(s) listos para validar.`);
        });
    }

    private onsuccess(result: Record<string, string> | null): void {
        console.log('QR Code result:', result);
        if (!result) {
            alert('No se detectó un código QR válido. Intenta de nuevo.');
            return;
        }

        const alreadyExists = this.qrResults.some(r => r.id === result.id);

        if (!alreadyExists) {
            this.qrResults.push(result);
            renderQrTable('cameraQrResultContainer', this.qrResults);
        } else {
            this.ss.warning('Ya escaneado', 'Este CFDI ya fue escaneado.');
        }
    }

    private onerror(error: any): void {
        console.error('QR Code error:', error);
    }

    private onException(e: any): void {
        console.error('QR Code exception:', e);
        alert('Error al iniciar la cámara: ' + e.message);
    }

    public destroy(): void {
        $('#startCameraBtn').off('click');
        $('#stopCameraBtn').off('click');
        $(document).off('click', '.btn-home');
        $(document).off('click', '.btn-remove');
        $('#validateQrBtn').off('click');
        this.qr.stopCamera(this.videoElement);
        this.qrResults = [];
        this.cameraSelect.empty();
    }
}
