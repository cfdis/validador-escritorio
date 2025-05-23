// qrScanShared.ts
import $ from 'jquery';
import { DataEntry } from '../utils/Interfaces';
import { ToastService } from './ToastService';
import { SpinnerService } from './SpinnerService';
import { ValidacionCfdiResponse } from '../utils/Types';
import { FrontApi } from './FrontApi';

export class ValidacionService extends FrontApi {
    private validationApi;

    constructor(
        ts: ToastService,
        private ss: SpinnerService,
    ) {
        super(ts);
        this.validationApi = window.validationApi;
    }

    renderTable(tableContainerId: string, entries: DataEntry[]) {
        const tbody = $('#' + tableContainerId).find('tbody');

        if (tbody.length === 0) {
            return;
        }

        tbody.empty();

        entries.forEach((item, index) => {

            let data = `<td colspan="4" class="px-3 py-2"> No se encontró un QR válido </td>`;
            let validarBtn = '';

            if (item.qrData) {
                data = `
                            <td class="px-3 py-2" title="${item.qrData.id}">${item.qrData.id}</td>
                            <td class="px-3 py-2" title="${item.qrData.re}">${item.qrData.re}</td>
                            <td class="px-3 py-2" title="${item.qrData.rr}">${item.qrData.rr}</td>
                            <td class="px-3 py-2" title="${item.qrData.tt}">${item.qrData.tt}</td>
                        `;

                // icono para boton revalidar/validar
                const iconValidar = item.result?.resultado ? 'sync' : 'check_circle';
                const colorValidar = item.result?.resultado ? 'text-yellow-500' : 'text-green-500';
                const colorValidarHover = item.result?.resultado ? 'text-yellow-700' : 'text-green-700';
                const validarText = item.result?.resultado ? 'Revalidar' : 'Validar';
                validarBtn = `<button class="validar-single-btn btn ${colorValidar} hover:${colorValidarHover} text-xs px-2 py-1 rounded" data-id="${item.qrData?.id}" title="${validarText}">
                                    <i class="material-icons">${iconValidar}</i>
                                </button>`;
            }

            let dataResult = ' <td colspan="3" class="px-3 py-2"> - </td>';
            if (item.result?.resultado) {
                dataResult = `
                            <td class="px-3 py-2" title="${item.result.resultado.Estado || ''}">${item.result.resultado.Estado || '-'}</td>
                            <td class="px-3 py-2" title="${item.result.resultado.EsCancelable || ''}">${item.result.resultado.EsCancelable || '-'}</td>
                            <td class="px-3 py-2" title="${item.result.resultado.EstatusCancelacion || ''}">${item.result.resultado.EstatusCancelacion || '-'}</td>
                        `;
            } else if (item.result?.error) {
                dataResult = `
                            <td colspan="3" class="px-3 py-2 text-orange-600"> ${item.result.error} </td>
                        `;
            }

            const row = $(`
                        <tr class="border-b border-gray-600">
                            <td class="px-3 py-2" title="${item.file?.name || 'Cámara'}">${item.file?.name || 'Cámara'}</td>
                            ${data}
                            ${dataResult}
                            <td class="px-3 py-2">
                                <button class="text-red-500 hover:text-red-700 font-semibold btn-remove" data-index="${index}">
                                    <i class="material-icons">delete</i>
                                </button>
                                ${validarBtn}
                            </td>
                        </tr>
                    `);
            tbody.append(row);
        });


        $('#' + tableContainerId).toggle(entries.length > 0);
    }

    async validateBulk(entries: DataEntry[]): Promise<ValidacionCfdiResponse | void> {
        let validos = entries.filter(entry => entry.qrData !== null);
        if (validos.length === 0) {
            this.ts.warning('No hay CFDI(s) para validar', 'Ningún archivo contiene un CFDI válido.');
            return;
        }

        // const datos = validos.map(entry => entry.qrData);

        this.ss.show()
        const response = await this.validationApi.validateBulk(validos);
        return this.handleResponse<ValidacionCfdiResponse>(response).finally(() => {
            this.ss.hide();
        });
    }
}

export function renderQrTable(tableContainerId: string, entries: DataEntry[]) {
    const tbody = $('#' + tableContainerId).find('tbody');

    if (tbody.length === 0 || entries.length === 0) {
        return;
    }

    tbody.empty();

    entries.forEach((item, index) => {

        let data = `<td colspan="4" class="px-3 py-2"> No se encontró un QR válido </td>`;

        if (item.qrData) {
            data = `
                        <td class="px-3 py-2" title="${item.qrData.id}">${item.qrData.id}</td>
                        <td class="px-3 py-2" title="${item.qrData.re}">${item.qrData.re}</td>
                        <td class="px-3 py-2" title="${item.qrData.rr}">${item.qrData.rr}</td>
                        <td class="px-3 py-2" title="${item.qrData.tt}">${item.qrData.tt}</td>
                    `;
        }

        const row = $(`
                    <tr class="border-b border-gray-600">
                        <td class="px-3 py-2" title="${item.file?.name || 'Cámara'}">${item.file?.name || 'Cámara'}</td>
                        ${data}
                        <td class="px-3 py-2" title="${item.result?.resultado?.Estado || ''}">${item.result?.resultado?.Estado || '-'}</td>
                        <td class="px-3 py-2" title="${item.result?.resultado?.EsCancelable || ''}">${item.result?.resultado?.EsCancelable || '-'}</td>
                        <td class="px-3 py-2" title="${item.result?.resultado?.EstatusCancelacion || ''}">${item.result?.resultado?.EstatusCancelacion || '-'}</td>
                        <td class="px-3 py-2">
                            <button class="btn text-red-500 hover:text-red-700 font-semibold btn-remove" data-index="${index}">
                                <i class="material-icons">delete</i>
                            </button>
                        </td>
                    </tr>
                `);
        tbody.append(row);
    });


    $('#' + tableContainerId).toggle(entries.length > 0);
}
