import $ from 'jquery';
import type { View } from '../interfaces/View';
import { QrService } from '../services/QrService';
import { ToastService } from '../services/ToastService';
import { QrParams, ValidacionCfdiResponse } from '../utils/Types';
import { SpinnerService } from '../services/SpinnerService';
import { DataEntry } from '../utils/Interfaces';
import { ValidacionService } from '../services/ValidacionService';

export class QrScanFileView implements View {
    private fileType: string = '';
    private entries: DataEntry[] = [];

    constructor(
        private qr: QrService,
        private ts: ToastService,
        private ss: SpinnerService,
        private vs: ValidacionService,
    ) { }

    public init(params: any): void {
        const fileInput = $('#fileInput');
        const title = $('#uploadTitle');
        this.fileType = params.type || 'all';

        switch (params.type) {
            case 'xml':
                fileInput.attr('accept', '.xml');
                title.text('Escanear QR desde XML');
                break;
            case 'pdf':
                fileInput.attr('accept', '.pdf');
                title.text('Escanear QR desde PDF');
                break;
            case 'image':
                fileInput.attr('accept', 'image/*');
                title.text('Escanear QR desde Imagen');
                break;
            default:
                fileInput.attr('accept', 'image/*, .pdf, .xml');
                break;
        }

        this.bindEvents();
    }

    private async procesarArchivos(files: File[]) {
        this.ss.show();
        for (const file of files) {
            // si el archivo ya existe, no lo agregamos
            const sameFile = this.entries.some(entry => entry.file?.name === file.name && entry.file.size === file.size);
            if (sameFile) {
                this.ts.warning('Archivo duplicado', `El archivo ${file.name} ya se encuentra en la lista.`);
                continue;
            }

            let qrData: QrParams | null = null;
            switch (this.fileType) {
                case 'image':
                    qrData = await this.qr.scanImage(file);
                    break;
                case 'pdf':
                    qrData = await this.qr.scanFromPdf(file);
                    break;
                case 'xml':
                    qrData = await this.scanFromXml(file);
                    break;
            }

            let DataEntry = {
                file: file,
                qrData: qrData,
            } as DataEntry;

            // si ya existe una entrada con un id igual, no la agregamos
            const alreadyExists = this.entries.some(entry => entry.qrData?.id === DataEntry.qrData?.id);
            if (DataEntry.qrData && alreadyExists) {
                this.ts.warning('Ya procesado', `El CFDI con ID ${DataEntry.qrData?.id} ya se encuentra en la lista.`);
                continue;
            }

            this.entries.push(DataEntry);
        }
        this.vs.renderTable('qrResultContainer', this.entries);
        
        this.ss.hide();
    }

    private scanFromXml(file: File): Promise<QrParams | null> {
        const xmlApi = window.xml;
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const xmlString = e.target?.result as string;
                resolve(xmlApi.preProcess(xmlString));
            };
            reader.readAsText(file);
        });
    }

    private bindEvents(): void {
        $('#fileInput').on('change', async (e) => {
            const input = e.target as HTMLInputElement;

            if (!input.files || input.files.length === 0) return;

            const files = Array.from(input.files);

            this.procesarArchivos(files);

            input.value = '';
        });

        $(document).on('click', '.btn-remove', (e) => {
            const index = parseInt($(e.currentTarget).data('index'), 10);
            if (!isNaN(index)) {
                this.entries.splice(index, 1);
                this.vs.renderTable('qrResultContainer', this.entries);
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
                    this.vs.renderTable('qrResultContainer', this.entries);
                }
            }).catch((err) => {
                this.vs.handleError(err);
            });
        });
    }

    public destroy(): void {
        $('#fileInput').off('change');
        $(document).off('click', '.btn-remove');
        $('#validateQrBtn').off('click');
        this.entries = [];
    }
}