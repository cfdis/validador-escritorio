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
    private db = window.db;

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
                    $('<option class="btn">').val(device.deviceId).text(device.label || `Cámara ${this.cameraSelect.children().length}`)
                );
            });
        });
    }

    private bindEvents(): void {
        $('#startCameraBtn').on('click', async (e: any) => {
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

        $('#stopCameraBtn').on('click', (e: any) => {
            e.preventDefault();
            this.qr.stopCamera(this.videoElement);
            $('#startCameraBtn').removeClass('hidden');
            $('#stopCameraBtn').addClass('hidden');
        });

        $(document).on('click', '.btn-home', (e: any) => {
            e.preventDefault();
            this.qr.stopCamera(this.videoElement);
        });

        $(document).on('click', '.btn-remove', (e: any) => {
            const index = parseInt($(e.currentTarget).data('index'), 10);
            if (!isNaN(index)) {
                this.entries.splice(index, 1);
                this.vs.renderTable('cameraQrResultContainer', this.entries);
            }
        });

        $('#validateQrBtn').on('click', () => {
            if (this.entries.length === 0) {
                this.ts.warning('Alerta', 'No hay CFDIs para validar.');
                return;
            }

            this.validar(this.entries);
        });

        $(document).on('click', '.validar-single-btn', (e) => {
            const id = $(e.currentTarget).data('id');
            const entry = this.entries.find(entry => entry.qrData?.id === id);
            if (entry) {
                this.validar([entry]);
            }
        });
    }

    private validar(entries: DataEntry[]): void {
        this.vs.validateBulk(entries).then((response: ValidacionCfdiResponse | void) => {
            if (response) {
                response.data.forEach(element => {
                    const index = this.entries.findIndex(entry => entry.qrData?.id === element.id);
                    if (index !== -1) {
                        this.entries[index].result = element;
                    }
                });

                if (!response.success) {
                    let extraMessage = '';
                    response.data.filter(item => item.error !== undefined).forEach((item) => {
                        extraMessage += `<br>${item.id} -> ${item.error}`;
                    }
                    );
                    this.ts.warning('Alerta', response.message + extraMessage);
                }

                this.vs.renderTable('cameraQrResultContainer', this.entries);
            }
        }).catch((err) => {
            this.vs.handleError(err);
        });
    }

    private onsuccess(result: QrParams | null): void {
        if (!result) {
            alert('No se detectó un código QR válido. Intenta de nuevo.');
            return;
        }

        this.beep();

        let fileEntry = {
            qrData: result,
        } as DataEntry;

        // si ya existe una entrada con un id igual, no la agregamos
        const alreadyExists = this.entries.some(entry => entry.qrData?.id === fileEntry.qrData?.id);
        if (fileEntry.qrData && alreadyExists) {
            this.ts.warning('Ya escaneado', `El CFDI con ID ${fileEntry.qrData?.id} ya se encuentra en la lista.`);
            return;
        }

        const uuid = fileEntry.qrData?.id || '';

        this.db.cfdi.getByUuid(uuid).then((result: any) => {
            if (result) {
                fileEntry.result = {
                    id: result.uuid,
                    resultado: {
                        CodigoEstatus: '',
                        EsCancelable: result.cancelable,
                        Estado: result.status,
                        EstatusCancelacion: result.cancel_status,
                        ValidacionEFOS: '',
                        UltimaFechaConsulta: result.ultima_validacion
                    }
                };

                this.entries.push(fileEntry);
                this.vs.renderTable('cameraQrResultContainer', this.entries);
            } else {
                this.entries.push(fileEntry);
                this.validar([fileEntry]);
            }
        }).catch((_: any) => {
            this.entries.push(fileEntry);
            this.validar([fileEntry]);
        });
        // this.vs.renderTable('cameraQrResultContainer', this.entries);
    }

    private onerror(_: any): void {
        // console.error('QR Code error:', error);
    }

    private onException(e: any): void {
        // console.error('QR Code exception:', e);
        alert('Error al iniciar la cámara: ' + e.message);
    }

    private beep(duration = 200, frequency = 900, volume = 1) {
        const context = new AudioContext();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gainNode.gain.value = volume;

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start();

        setTimeout(() => {
            oscillator.stop();
            context.close();
        }, duration);
    }


    public destroy(): void {
        $('#startCameraBtn').off('click');
        $('#stopCameraBtn').off('click');
        $(document).off('click', '.btn-home');
        $(document).off('click', '.btn-remove');
        $(document).off('click', '.validar-single-btn');
        $('#validateQrBtn').off('click');
        this.qr.stopCamera(this.videoElement);
        this.entries = [];
        this.cameraSelect.empty();
    }
}
