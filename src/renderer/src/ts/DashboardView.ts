import $ from 'jquery';
import { ApiService } from '../services/ApiService';
import { UserService } from '../services/UserService';
import { RouterService } from '../services/RouterService';
import { View } from '../interfaces/View';

export class DashboardView implements View {
    constructor(
        private api: ApiService,
        private us: UserService,
        private rs: RouterService
    ) { }

    init() {
        this.bindEvents();
    }

    private bindEvents() {
        $('#scanFromCamera').on('click', () => this.rs.navigate('camera'));
        $('#scanFromImage').on('click', () => this.rs.navigate('image'));
    }

    destroy() {
        $('#scanFromCamera').off('click');
        $('#scanFromImage').off('click');
    }
}
