import $ from 'jquery';
import { ValidacionService } from '../services/ValidacionService';
import type { View } from '../interfaces/View';
import { QrService } from '../services/QrService';
import { ToastService } from '../services/ToastService';
import { QrParams, ValidacionCfdiResponse } from '../utils/Types';
import { DataEntry } from '../utils/Interfaces';

export class QrScanCameraView implements View {
    private selectedDeviceId: string | null = null;
    private entries: DataEntry[] = [];
    private videoElement: HTMLVideoElement;
    private cameraSelect: any;

    constructor(
        private qr: QrService,
        private ts: ToastService,
        private vs: ValidacionService,
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
                this.entries.splice(index, 1);
                this.vs.renderTable('cameraQrResultContainer', this.entries);
            }
        });

        $('#validateQrBtn').on('click', () => {
            this.vs.validateBulk(this.entries).then((response: ValidacionCfdiResponse | void) => {
                if (response) {
                    response.forEach(element => {
                        const index = this.entries.findIndex(entry => entry.qrData?.id === element.id);
                        if (index !== -1) {
                            this.entries[index].result = element;
                        }
                    });

                    this.vs.renderTable('cameraQrResultContainer', this.entries);
                }
            }).catch((err) => {
                this.vs.handleError(err);
            });
        });
    }

    private onsuccess(result: QrParams | null): void {
        if (!result) {
            alert('No se detectó un código QR válido. Intenta de nuevo.');
            return;
        }

        let fileEntry = {
            qrData: result,
        } as DataEntry;

        // si ya existe una entrada con un id igual, no la agregamos
        const alreadyExists = this.entries.some(entry => entry.qrData?.id === fileEntry.qrData?.id);
        if (fileEntry.qrData && alreadyExists) {
            this.ts.warning('Ya escaneado', `El CFDI con ID ${fileEntry.qrData?.id} ya se encuentra en la lista.`);
            return;
        }

        this.entries.push(fileEntry);

        this.vs.renderTable('cameraQrResultContainer', this.entries);
    }

    private onerror(error: any): void {
        // console.error('QR Code error:', error);
    }

    private onException(e: any): void {
        // console.error('QR Code exception:', e);
        alert('Error al iniciar la cámara: ' + e.message);
    }

    public destroy(): void {
        $('#startCameraBtn').off('click');
        $('#stopCameraBtn').off('click');
        $(document).off('click', '.btn-home');
        $(document).off('click', '.btn-remove');
        $('#validateQrBtn').off('click');
        this.qr.stopCamera(this.videoElement);
        this.entries = [];
        this.cameraSelect.empty();
    }
}
