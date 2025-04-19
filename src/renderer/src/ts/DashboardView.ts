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
        $('#scanFromImage').on('click', () => this.rs.navigate('image'));
        $('#scanFromPdf').on('click', () => this.rs.navigate('pdf'));
    }

    destroy() {
        $('#scanFromCamera').off('click');
        $('#scanFromImage').off('click');
    }
}
