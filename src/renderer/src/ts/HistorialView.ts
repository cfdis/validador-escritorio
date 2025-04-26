import $ from 'jquery';
import { View } from '../interfaces/View';
import { QrParams } from '../utils/Types';
import { SpinnerService } from '../services/SpinnerService';
import { ValidacionService } from '../services/ValidacionService';

export class HistorialView implements View {
    private db: any;
    private cfdis: any[] = [];
    constructor(
        private ss: SpinnerService,
        private vs: ValidacionService
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
            this.renderTable(result);
        }).catch((err: any) => {
            console.error('Error al cargar los CFDIs', err);
        }).finally(() => {
            this.ss.hide();
        });
    }

    private renderTable(cfdis: any[]) {
        this.cfdis = cfdis;

        const tbody = $('#historialTableBody');

        if (tbody.length === 0 || cfdis.length === 0) {
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
            switch (cfdi.status) {
                case 'Vigente':
                    statusIcon = 'check_circle';
                    statusIconClass = 'text-green-600';
                    break;
                case 'Cancelado':
                    statusIcon = 'cancel';
                    statusIconClass = 'text-orange-600';
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
                <td class="px-3 py-2 space-x-2 text-center">
                    <button class="revalidar-btn btn bg-yellow-600 hover:bg-yellow-700 text-xs px-2 py-1 rounded" data-id="${cfdi.id}" title="Revalidar"><i class="material-icons">sync</i></button>
                    <button class="eliminar-btn btn bg-red-600 hover:bg-red-700 text-xs px-2 py-1 rounded" data-id="${cfdi.id}" title="Eliminar"><i class="material-icons">delete</i></button>
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

        this.vs.validate(params).then(() => {
            this.loadPage();
        }).catch((err) => {
            this.vs.handleError(err);
        });

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
    }

    private unbindEvents() {
        // Aquí puedes eliminar los eventos que hayas agregado en bindEvents
        // para evitar duplicados o problemas de rendimiento al cambiar de vista
        $('#historialTableBody').off('click', '.eliminar-btn');
        $('#historialTableBody').off('click', '.revalidar-btn');
    }

    destroy(): void {
        this.unbindEvents();
    }
}