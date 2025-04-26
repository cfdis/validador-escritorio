import $ from 'jquery';
import { RouterService } from '../services/RouterService';
import { View } from '../interfaces/View';
import { ToastService } from '../services/ToastService';

export class DashboardView implements View {
    constructor(
        private rs: RouterService,
    ) { }

    init() {
        this.bindEvents();
    }

    private bindEvents() {
        $('#scanFromCamera').on('click', () => this.rs.navigate('camera'));
        $('#scanFromImage').on('click', () => this.rs.navigate('scanFile', { type: 'image' }));
        $('#scanFromPdf').on('click', () => this.rs.navigate('scanFile', { type: 'pdf' }));
        $('#scanFromXml').on('click', () => this.rs.navigate('scanFile', { type: 'xml' }));
        // $('#reportesBtn').on('click', () => this.rs.navigate('reportes'));
        $('#historialBtn').on('click', () => this.rs.navigate('historial'));
    }

    destroy() {
        $('#scanFromCamera').off('click');
        $('#scanFromImage').off('click');
    }
}
