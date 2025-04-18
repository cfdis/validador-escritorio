import $ from 'jquery';
import { ApiService } from '../services/ApiService';
import { UserService } from '../services/UserService';
import { RouterService } from '../services/RouterService';
import { View } from '../interfaces/View';
import { SpinnerService } from '../services/SpinnerService';

export class LoginView implements View {
    constructor(
        private api: ApiService,
        private us: UserService,
        private rs: RouterService,
        private ss: SpinnerService
    ) { }

    init(): void {
        this.bindEvents();

    }

    private bindEvents(): void {
        $('#loginButton').on('click', (e) => this.handleLogin(e));
    }

    private handleLogin(e): void {
        e.preventDefault();

        const email = $('#email').val()?.toString().trim().toLowerCase() || '';
        const password = $('#password').val()?.toString().trim() || '';

        if (!email || !password) {
            alert('Correo y contraseña obligatorios');
            return;
        }

        this.ss.show();

        this.api.post('login', {}, { email, password })
            .then((response) => {
                window.auth.setToken(response.token).then((guardado: boolean) => {
                    if (guardado) {
                        this.rs.navigate('dashboard').then(() => {
                            this.loadUser();
                        });
                    } else {
                        alert('Falló el inicio de sesión, intenta de nuevo más tarde.');
                    }
                });
            })
            .catch((error) => {
                if (error.status === 401 || error.status === 422) {
                    alert('Usuario o contraseña incorrectos');
                } else {
                    this.api.handleError(error);
                }
                setTimeout(() => $('#email').focus(), 100);
            })
            .finally(() => {
                this.ss.hide();
            });
    }

    private loadUser() {
        const user = this.us.getUser();
        if (user) {
            $('#userName').text(user.name || 'Usuario');
            $('#userEmail').text(user.email || '');
            $('#userAvatar').attr('src', user.avatar || 'assets/img/default-user.jpg');
            $('#userMenu').show();
        }
    }

    destroy(): void {
        $('#loginButton').off(); // Limpieza de eventos
    }
}
