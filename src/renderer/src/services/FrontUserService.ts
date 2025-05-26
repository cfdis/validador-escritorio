import $ from "jquery";
import { ApiErrorDetails, User } from "../utils/Interfaces";
import { FrontApi } from "./FrontApi";
import { ToastService } from "./ToastService";

export class FrontUserService extends FrontApi {
    _user = undefined;
    _empresas = {};
    _empresaPromise = undefined;
    lastCheckLoginTime = 0;
    lastCheckLoginResult = null;
    checkLoginPromise = null;
    cacheTTL = 500;
    private auth: typeof window.auth;

    constructor(
        ts: ToastService,
    ) {
        super(ts);
        this.auth = window.auth;
    }

    async login(email: string, password: string, remember: boolean = false) {
        const response = await this.auth.login(email, password, remember);
        return this.handleResponse<void>(response);
    }

    async loginDirect(email: string) {
        const response = await this.auth.loginDirect(email);
        return this.handleResponse<boolean>(response);
    }

    async logout(fullLogout: boolean = true) {
        const response = await this.auth.logout(fullLogout);
        return this.handleResponse<void>(response);
    }

    async getUser() {
        const response = await this.auth.getUser();
        return this.handleResponse<User>(response);
    }

    async checkLogin(empresaId?: number) {
        const response = await this.auth.checkLogin(empresaId);

        if (response.data && response.data === true) {
            await this.loadUser();
        } else {
            $('#userMenu').hide();
        }
        return this.handleResponse<boolean>(response);
    }

    async obtenerUsuariosGuardados(): Promise<Record<string, string>[]> {
        const response = await this.auth.getSavedUsers();
        return this.handleResponse<Record<string, string>[]>(response);
    }

    async eliminarUsuarioGuardado(email: string): Promise<void> {
        const response = await this.auth.deleteSavedUser(email);
        return this.handleResponse<void>(response);
    }

    private async loadUser() {
        this.getUser().then((user: User) => {
            if (user && !$('#userMenu').is(':visible')) {
                $('#userName').text(user.name || 'Usuario');
                $('#userEmail').text(user.email || '');
                $('#userAvatar').attr('src', user.avatar || 'assets/img/default-user.jpg');
                $('#userMenu').show();
            }
        }).catch((error: ApiErrorDetails) => {
            this.handleError(error);
        });
    }
}
