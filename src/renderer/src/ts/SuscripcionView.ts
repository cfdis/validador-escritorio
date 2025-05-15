import $ from "jquery";
import { View } from "../interfaces/View";
import { FrontUserService } from "../services/FrontUserService";
import { SuscripcionValidador } from "../utils/Interfaces";
import { SpinnerService } from "../services/SpinnerService";

export class SuscripcionView implements View {
    suscripciones: SuscripcionValidador[] = [];
    restantes: number = 0;
    openExternal: any;

    constructor(
        private us: FrontUserService,
        private ss: SpinnerService,
    ) {
        this.openExternal = window.api.openExternal
    }

    init(): void {
        this.bindEvents();
        this.cargarPagina();
    }

    bindEvents(): void {
        const self = this;
        $(document).on('click', '#verPlanes', () => {
            self.openExternal('subscriptions');
        });

        $(document).on('click', '.admin-suscripciones', () => {
            self.openExternal('user/my-subscriptions');
        });
    }

    cargarPagina(): void {
        this.ss.show();

        this.us.getUser().then((user) => {
            if (user) {
                this.suscripciones = user.suscripciones_validador;
                this.restantes = user.validaciones_restantes || 0
                this.renderSuscripciones();
            }
        }).catch((error) => {
            this.us.handleError(error);
        }).finally(() => {
            this.ss.hide();
        });
    }

    renderSuscripciones(): void {
        const suscripcionesContainer = $('#suscripcionesContainer');
        suscripcionesContainer.empty();

        if (this.suscripciones.length === 0) {
            const noSuscripciones = this.getNoSuscripciones()
            suscripcionesContainer.append(noSuscripciones);
            return;
        }

        this.suscripciones.forEach((suscripcion) => {
            const card = this.getCard(suscripcion);
            suscripcionesContainer.append(card);
        });
    }

    getNoSuscripciones(): string {
        return `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4 transition hover:shadow-lg text-gray-800 dark:text-gray-100">
            <h3 class="text-xl font-bold mb-2">No tienes suscripciones activas</h3>
            <p class="mb-2">Validaciones restantes este mes: <strong>${this.restantes}</strong></p>
            <p class="mb-4">Contrata un plan y obtén los siguientes beneficios:</p>
            <ul class="list-disc list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Validaciones ilimitadas</li>
                <li>Validación desde imágenes</li>
                <li>Validación desde archivos PDF</li>
                <li>Validación desde archivos XML (básico)</li>
            </ul>
            <button class="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition duration-150" id="verPlanes">
                Ver planes
            </button>
        </div>`;
    }

    getCard(suscripcion: SuscripcionValidador): string {
        const isPastDue = suscripcion.status === 'past_due';

        if (isPastDue) {
            return `
            <div class="bg-red-100 dark:bg-red-900 rounded-xl shadow-md p-4 mb-4 text-red-800 dark:text-red-100">
                <h3 class="text-lg font-bold mb-2">Suscripción en riesgo</h3>
                <p class="mb-2">${suscripcion.extra?.reject_reason ?? 'Problema con el método de pago'}</p>
                <p class="mb-1">Por favor verifica tu método de pago.</p>
                <p class="mb-1">El sistema reintentará el cobro cada 48 horas. Después de tres intentos fallidos, tu suscripción será cancelada automáticamente.</p>
                <p class="mb-4">Puedes cancelar y volver a contratar con otro método si lo deseas. Para ayuda, contacta a soporte.</p>
                <button
                    class="admin-suscripciones btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl transition duration-150"
                >
                    Administrar
                </button>
            </div>`;
        }

        const proximoCargo = suscripcion.end_date
            ? `Válida hasta: ${this.formatDate(suscripcion.end_date)}`
            : (suscripcion.extra?.billing_cycle_end ?
                `Próximo cargo: ${this.formatDate(suscripcion.extra.billing_cycle_end)}`
                : ''
            );

        const cancelada = suscripcion.cancellation_date
            ? `<p class="text-red-600 dark:text-red-400 font-semibold">Suscripción cancelada</p>`
            : '';

        return `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4 transition hover:shadow-lg text-gray-800 dark:text-gray-100">
            <h3 class="text-lg font-bold mb-1">Suscripción activa</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Plan: ${suscripcion.plan_validador?.name}</p>
            ${cancelada}
            <p class="mb-1">${proximoCargo}</p>
            
            <button
                class="admin-suscripciones btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition duration-150"
            >
                Administrar
            </button>
        </div>`;
    }

    formatDate(dateString?: string): string {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    destroy(): void {
        $(document).off('click', '#verPlanes');
        $(document).off('click', '.admin-suscripciones');
    }

}