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
        this.rescatarUsuarios();
    }

    private bindEvents(): void {
        $('#loginForm').on('submit', (e) => this.handleLogin(e));
        $('#useAnotherAccount').on('click', () => this.mostrarFormulario());

        $('#userList').on('click', '.user-btn', (e) => {
            const email = $(e.currentTarget).data('email');
            this.us.loginDirect(email).then((loggedIn: boolean) => {
                this.ss.show();
                if (loggedIn) {
                    this.rs.navigate('dashboard');
                } else {
                    this.ts.warning('La sesión ha caducado', 'Por favor, inicia sesión nuevamente.');
                    this.us.logout();
                    $('#email').val(email);
                    $('#password').val('');
                    $('#rememberUser').prop('checked', true);
                    this.mostrarFormulario();
                }
            }).catch((error) => this.us.handleError(error))
                .finally(() => { this.ss.hide() });
        });

        $('#userList').on('click', '.forget-btn', (e) => {
            e.stopPropagation();
            const email = $(e.currentTarget).data('email');
            if (!confirm(`¿Estás seguro de que quieres dejar de recordar el usuario "${email}"?`)) {
                return;
            }
            this.us.eliminarUsuarioGuardado(email).then(() => {
                this.ts.success('Usuario eliminado', `Se ha dejado de recordar el usuario "${email}".`);
                this.rescatarUsuarios();
            }).catch((error: ApiErrorDetails) => {
                this.us.handleError(error);
            });
        });
    }

    private rescatarUsuarios(): void {
        this.us.obtenerUsuariosGuardados().then((usuarios: Record<string, string>[]) => {
            if (usuarios.length > 0) {
                this.mostrarListaUsuarios(usuarios);
            } else {
                this.mostrarFormulario();
            }
        }).catch((error) => this.us.handleError(error));
    }

    private mostrarFormulario(): void {
        $('#userListContainer').addClass('hidden');
        $('#loginFormContainer').removeClass('hidden');
    }

    private mostrarListaUsuarios(usuarios: Record<string, string>[]): void {
        $('#userList').html('');
        usuarios.forEach(u => {
            const avatarSrc = u.avatar.length ? u.avatar : 'assets/img/default-user.jpg';
            $('#userList').append(`<div class="btn user-btn flex justify-between items-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded px-3 py-2"
                data-email="${u.email}" title="${u.email}">
                    <div class="flex-shrink-0 mr-2 w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <img src="${avatarSrc}" alt="User" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-1 min-w-0">
                        <span class="block text-left truncate">
                            ${u.email}
                        </span>
                    </div>
                    <button class="btn forget-btn text-red-500 text-sm ml-2 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600
                        rounded p-2" data-email="${u.email}" title="Dejar de recordar">
                    ✕
                    </button>
                </div>`);
        });
        $('#userListContainer').removeClass('hidden');
        $('#loginFormContainer').addClass('hidden');
    }

    private handleLogin(e): void {
        e.preventDefault();

        const email = $('#email').val()?.toString().trim().toLowerCase() || '';
        const password = $('#password').val()?.toString().trim() || '';
        const remember = $('#rememberUser').is(':checked');

        if (!email || !password) {
            this.ts.error('Error', 'Correo y contraseña obligatorios');
            return;
        }

        this.ss.show();

        this.us.login(email, password, remember).then(() => {
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
        $('#loginForm').off('submit');
        $('#useAnotherAccount').off('click');
        $('#userList').off('click', '.user-btn');
        $('#userList').off('click', '.forget-btn');
        $('#userList').html(''); // Limpia la lista de usuarios
    }
}
