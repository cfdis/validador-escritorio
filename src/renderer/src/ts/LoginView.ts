import $ from 'jquery';
import { RouterService } from '../services/RouterService';
import { View } from '../interfaces/View';
import { SpinnerService } from '../services/SpinnerService';
import { FrontUserService } from '../services/FrontUserService';
import { ToastService } from '../services/ToastService';
import { ApiErrorDetails } from '../utils/Interfaces';

export class LoginView implements View {
    constructor(
        private us: FrontUserService,
        private rs: RouterService,
        private ss: SpinnerService,
        private ts: ToastService,
    ) { }

    init(): void {
        this.bindEvents();

    }

    private bindEvents(): void {
        $('#loginForm').on('submit', (e) => this.handleLogin(e));
    }

    private handleLogin(e): void {
        e.preventDefault();

        const email = $('#email').val()?.toString().trim().toLowerCase() || '';
        const password = $('#password').val()?.toString().trim() || '';

        if (!email || !password) {
            this.ts.error('Error', 'Correo y contraseña obligatorios');
            return;
        }

        this.ss.show();

        this.us.login(email, password).then(() => {
            this.rs.navigate('dashboard').then(() => {
                this.ss.hide();
            });
        }).catch((error: ApiErrorDetails) => {
            if (error.status === 401 || error.status === 422) {
                this.ts.error('Error de autenticación', 'Usuario o contraseña incorrectos');
                return;
            }
            this.us.handleError(error);
        }).finally(() => { this.ss.hide() });
    }

    destroy(): void {
        $('#loginButton').off(); // Limpieza de eventos
    }
}
