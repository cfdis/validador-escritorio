import $ from 'jquery';
import type { View } from '../interfaces/View';
import { QrService } from '../services/QrService';
import { ToastService } from '../services/ToastService';
import { QrParams } from '../utils/Types';

export class QrScanFileView implements View {
    private fileType: string = '';
    private entries: FileEntry[] = [];

    constructor(
        private qr: QrService,
        private ss: ToastService,
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
        for (const file of files) {
            // si el archivo ya existe, no lo agregamos
            const sameFile = this.entries.some(entry => entry.file.name === file.name && entry.file.size === file.size);
            if (sameFile) {
                this.ss.warning('Archivo duplicado', `El archivo ${file.name} ya se encuentra en la lista.`);
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
                    // qrData = await this.qr.scanFromXml(file);
                    break;
            }

            let fileEntry = {
                file: file,
                qrData: qrData,
            } as FileEntry;

            // si ya existe una entrada con un id igual, no la agregamos
            const alreadyExists = this.entries.some(entry => entry.qrData?.id === fileEntry.qrData?.id);
            if (fileEntry.qrData && alreadyExists) {
                this.ss.warning('Ya procesado', `El CFDI con ID ${fileEntry.qrData?.id} ya se encuentra en la lista.`);
                continue;
            }

            this.entries.push(fileEntry);
        }
        this.renderTable(this.entries);
    }

    private renderTable(entries: FileEntry[]): void {
        const tbody = $('#qrResultsTableBody');
        if (tbody.length === 0 || entries.length === 0) {
            return;
        }

        tbody.empty();

        entries.forEach((item, index) => {

            let data = `<td colspan="4" class="px-3 py-2"> No se encontró un QR válido </td>`;

            if (item.qrData) {
                data = `
                    <td class="px-3 py-2">${item.qrData.id}</td>
                    <td class="px-3 py-2">${item.qrData.re}</td>
                    <td class="px-3 py-2">${item.qrData.rr}</td>
                    <td class="px-3 py-2">$${item.qrData.tt}</td>
                `;
            }

            const row = $(`
                <tr class="border-b border-gray-600">
                    <td class="px-3 py-2">${item.file.name}</td>
                    ${data}
                    <td class="px-3 py-2">
                        <button class="text-red-500 hover:text-red-700 font-semibold btn-remove" data-index="${index}">
                            <i class="material-icons">delete</i>
                        </button>
                    </td>
                </tr>
            `);
            tbody.append(row);
        });

        $('#qrResultContainer').toggle(entries.length > 0);
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
                this.renderTable(this.entries);
            }
        });

        $('#validateQrBtn').on('click', () => {
            let validos = this.entries.filter(entry => entry.qrData !== null);
            if (validos.length === 0) {
                this.ss.warning('No hay CFDI(s) para validar', 'Ningún archivo contiene un CFDI válido.');
                return;
            }
            alert(`Aún no implementado, pero tenemos ${validos.length} CFDI(s) listos para validar.`);
        });
    }

    public destroy(): void {
        $('#fileInput').off('change');
        $(document).off('click', '.btn-remove');
        $('#validateQrBtn').off('click');
        this.entries = [];
    }
}

interface FileEntry {
    file: File;
    qrData: Record<string, string> | null;
}