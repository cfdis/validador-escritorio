import $ from 'jquery';
import { RouterService } from '../services/RouterService';
import { View } from '../interfaces/View';
import { SpinnerService } from '../services/SpinnerService';
import { FrontUserService } from '../services/FrontUserService';
import { ToastService } from '../services/ToastService';
import { ApiErrorDetails, User } from '../utils/Interfaces';

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
                this.loadUser();
            });
        }).catch((error: ApiErrorDetails) => {
            if (error.status === 401 || error.status === 422) {
                this.ts.error('Error de autenticación', 'Usuario o contraseña incorrectos');
                return;
            }
            this.us.handleError(error);
        }).finally(() => { this.ss.hide() });
    }

    private loadUser() {
        this.us.getUser().then((user: User) => {
            if (user) {
                $('#userName').text(user.name || 'Usuario');
                $('#userEmail').text(user.email || '');
                $('#userAvatar').attr('src', user.avatar || 'assets/img/default-user.jpg');
                $('#userMenu').show();
            }
        }).catch((error: ApiErrorDetails) => {
            this.us.handleError(error);
        });
    }

    destroy(): void {
        $('#loginButton').off(); // Limpieza de eventos
    }
}
