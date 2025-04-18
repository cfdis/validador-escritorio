import $ from 'jquery';
import { renderQrTable } from '../utils/qrScanShared';
import type { View } from '../interfaces/View';
import { QrService } from '../services/QrService';
import { ToastService } from '../services/ToastService';

export class QrScanPdfView implements View {
    private qrResults: Record<string, string>[] = [];

    constructor(
        private qr: QrService,
        private ss: ToastService,
    ) { }

    public init(): void {
        this.bindEvents();
    }

    private bindEvents(): void {
        $('#pdfInput').on('change', async (e) => {
            const input = e.target as HTMLInputElement;

            if (!input.files || input.files.length === 0) return;

            let anyFound = false;

            for (const file of Array.from(input.files)) {
                const result = await this.qr.scanFromPdf(file);
                if (result) {
                    const alreadyExists = this.qrResults.some(r => r.id === result.id);

                    if (!alreadyExists) {
                        this.qrResults.push(result);
                        renderQrTable('pdfQrResultContainer', this.qrResults);
                    } else {
                        this.ss.warning('Ya procesado', 'Este CFDI ya fue procesado.');
                    }
                    anyFound = true;
                }
            }

            input.value = '';
        });

        $(document).on('click', '.btn-remove', (e) => {
            const index = parseInt($(e.currentTarget).data('index'), 10);
            if (!isNaN(index)) {
                this.qrResults.splice(index, 1);
                renderQrTable('pdfQrResultContainer', this.qrResults);
            }
        });

        $('#validateQrBtnPdf').on('click', () => {
            console.log('Validando los siguientes QR desde PDF:', this.qrResults);
            alert(`Aún no implementado, pero tenemos ${this.qrResults.length} CFDI(s) listos para validar.`);
        });
    }

    public destroy(): void {
        $('#pdfInput').off('change');
        $(document).off('click', '.btn-remove');
        $('#validateQrBtnPdf').off('click');
        this.qrResults = [];
    }
}
