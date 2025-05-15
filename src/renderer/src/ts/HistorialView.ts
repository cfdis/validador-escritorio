import $ from 'jquery';
import { View } from '../interfaces/View';
import { QrParams, ValidacionCfdiResponse } from '../utils/Types';
import { SpinnerService } from '../services/SpinnerService';
import { ValidacionService } from '../services/ValidacionService';
import { DataEntry } from '../utils/Interfaces';
import { ToastService } from '../services/ToastService';

export class HistorialView implements View {
    private db: any;
    private cfdis: any[] = [];
    private filteredCfdis: any[] = [];
    constructor(
        private ss: SpinnerService,
        private vs: ValidacionService,
        private ts: ToastService
    ) {
        this.db = window.db;
    }

    init(): void {
        this.bindEvents();
        this.loadPage();
    }

    private loadPage() {
        this.ss.show();
        this.db.cfdi.getAll().then((result: any) => {
            this.cfdis = result;
            this.renderTable(this.cfdis);
        }).catch((err: any) => {
            console.error('Error al cargar los CFDIs', err);
        }).finally(() => {
            this.ss.hide();
        });
    }

    private renderTable(cfdis: any[]) {
        const tbody = $('#historialTableBody');

        if (tbody.length === 0) {
            return;
        }

        tbody.empty();

        const formatter = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
        });

        cfdis.forEach((cfdi) => {
            const ultima_validacion = cfdi.ultima_validacion ? new Date(cfdi.ultima_validacion) : null;
            const fechaYHora = ultima_validacion ? ultima_validacion.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }) : '-';

            let statusIcon = '';
            let statusIconClass = '';
            let hiddenClass = '';
            switch (cfdi.status) {
                case 'Vigente':
                    statusIcon = 'check_circle';
                    statusIconClass = 'text-green-600';
                    break;
                case 'Cancelado':
                    statusIcon = 'cancel';
                    statusIconClass = 'text-orange-600';
                    hiddenClass = 'hidden';
                    break;
                case 'No encontrado':
                    statusIcon = 'error';
                    statusIconClass = 'text-gray-600';
                    break;
                default:
                    statusIcon = 'help';
                    statusIconClass = 'text-gray-600';
                    break;
            }

            const row = `
            <tr class="border-b border-gray-600">
                <td class="px-3 py-2">${cfdi.uuid}</td>
                <td class="px-3 py-2">${cfdi.emisor_rfc}</td>
                <td class="px-3 py-2">${cfdi.receptor_rfc}</td>
                <td class="px-3 py-2">${formatter.format(cfdi.total)}</td>
                <td class="px-3 py-2">${fechaYHora}</td>
                <td class="px-3 py-2"><i class="material-icons ${statusIconClass}">${statusIcon}</i> &nbsp ${cfdi.status}</td>
                <td class="px-3 py-2">${cfdi.cancelable}</td>
                <td class="px-3 py-2">${cfdi.cancel_status || '-'}</td>
                <td class="px-3 py-2 space-x-2 text-left">
                    <button class="eliminar-btn btn text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded" data-id="${cfdi.id}" title="Eliminar"><i class="material-icons">delete</i></button>
                    <button class="revalidar-btn btn text-yellow-500 hover:text-yellow-700 text-xs px-2 py-1 rounded ${hiddenClass}" data-id="${cfdi.id}" title="Revalidar"><i class="material-icons">sync</i></button>
                </td>
            </tr>
            `;

            tbody.append(row);
        });
    }

    private eliminarCfdi(id: number) {
        if (!confirm('¿Estás seguro de que deseas eliminar este CFDI? Esta acción no se puede deshacer.')) {
            return;
        }

        this.db.cfdi.delete(id).then(() => {
            this.loadPage();
        });
    }

    private revalidarCfdi(id: number) {
        const cfdi = this.cfdis.find((cfdi) => cfdi.id === id);
        if (!cfdi) {
            console.error('CFDI no encontrado');
            return;
        }

        let params: QrParams = {
            id: cfdi.uuid,
            re: cfdi.emisor_rfc,
            rr: cfdi.receptor_rfc,
            tt: cfdi.total,
            fe: cfdi.fe,
        };

        // this.vs.validate(params).then(() => {
        //     this.loadPage();
        // }).catch((err) => {
        //     this.vs.handleError(err);
        // });

        let entry: DataEntry = {
            qrData: params,
        }

        this.vs.validateBulk([entry]).then((response: ValidacionCfdiResponse | void) => {
            if (response) {
                if (!response.success) {
                    this.ts.warning('Alerta', response.message + '<br>' + response.data[0]?.id + '<br>' + response.data[0]?.error);
                    return;
                }

                this.loadPage();
            }
        }).catch((err) => {
            this.vs.handleError(err);
        });
    }

    private aplicarFiltros() {
        const uuid = ($('#filtroUuid').val() as string)?.trim().toUpperCase();
        const emisor = ($('#filtroEmisor').val() as string)?.trim().toUpperCase();
        const receptor = ($('#filtroReceptor').val() as string)?.trim().toUpperCase();
        const status = ($('#filtroStatus').val() as string)?.trim();
        const fechaDesdeStr = ($('#filtroFechaDesde').val() as string);
        const fechaHastaStr = ($('#filtroFechaHasta').val() as string);
        const fechaDesde = fechaDesdeStr ? new Date(fechaDesdeStr + 'T00:00:00') : null;
        const fechaHasta = fechaHastaStr ? new Date(fechaHastaStr + 'T23:59:59') : null;
        const montoMin = parseFloat($('#filtroMontoMin').val() as string) || null;
        const montoMax = parseFloat($('#filtroMontoMax').val() as string) || null;

        this.filteredCfdis = this.cfdis.filter(c => {
            const cUuid = c.uuid?.toUpperCase() || '';
            const cEmisor = c.emisor_rfc?.toUpperCase() || '';
            const cReceptor = c.receptor_rfc?.toUpperCase() || '';
            const cFecha = c.ultima_validacion ? new Date(c.ultima_validacion) : null;
            const cTotal = c.total ?? 0;

            return (!uuid || cUuid.includes(uuid)) &&
                (!emisor || cEmisor.includes(emisor)) &&
                (!receptor || cReceptor.includes(receptor)) &&
                (!status || c.status === status) &&
                (!fechaDesde || (cFecha && cFecha >= new Date(fechaDesde))) &&
                (!fechaHasta || (cFecha && cFecha <= new Date(fechaHasta))) &&
                (montoMin === null || cTotal >= montoMin) &&
                (montoMax === null || cTotal <= montoMax);
        });

        this.renderTable(this.filteredCfdis);
    }

    private generarReporte() {
        const name = `Reporte - ${new Date().toLocaleDateString()}`;
        const filename = `${name}.csv`;

        let data = this.filteredCfdis.length > 0 ? this.filteredCfdis : this.cfdis;

        this.exportarCSV(data, filename);
    }

    private exportarCSV(data: any[], filename: string = 'reporte.csv') {
        if (data.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }

        const columnas: Record<string, string> = {
            uuid: 'UUID',
            emisor_rfc: 'RFC Emisor',
            // emisor_name: 'Nombre Emisor',
            receptor_rfc: 'RFC Receptor',
            // receptor_name: 'Nombre Receptor',
            total: 'Total',
            status: 'Estatus',
            cancelable: 'Es Cancelable',
            cancel_status: 'Estatus Cancelación',
        };

        const campos = Object.keys(columnas);

        const encabezados = campos.map(campo => columnas[campo]);
        const filas = data.map(row => campos.map(campo => {
            const valor = row[campo] ?? '';
            return `"${String(valor).replace(/"/g, '""')}"`;
        }).join(','));

        const contenidoCsv = [encabezados.join(','), ...filas].join('\r\n');
        const blob = new Blob([contenidoCsv], { type: 'text/csv;charset=utf-8;' });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    private bindEvents() {
        // Aquí puedes agregar los eventos que necesites para la vista de historial
        $('#historialTableBody').on('click', '.eliminar-btn', (event) => {
            const id = $(event.currentTarget).data('id');
            this.eliminarCfdi(id);
        });

        $('#historialTableBody').on('click', '.revalidar-btn', (event) => {
            const id = $(event.currentTarget).data('id');
            this.revalidarCfdi(id);
        });

        $('#btnAplicarFiltros').on('click', () => {
            this.aplicarFiltros();
        });

        $('#btnGenerarReporte').on('click', () => {
            this.generarReporte();
        });
    }

    private unbindEvents() {
        // Aquí puedes eliminar los eventos que hayas agregado en bindEvents
        // para evitar duplicados o problemas de rendimiento al cambiar de vista
        $('#historialTableBody').off('click', '.eliminar-btn');
        $('#historialTableBody').off('click', '.revalidar-btn');
        $('#btnAplicarFiltros').off('click');
        $('#btnGenerarReporte').off('click');
    }

    destroy(): void {
        this.unbindEvents();
    }
}