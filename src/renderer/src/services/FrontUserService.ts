import { User } from "../utils/Interfaces";
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

    async login(email: string, password: string) {
        const response = await this.auth.login(email, password);
        return this.handleResponse<void>(response);
    }

    async logout() {
        const response = await this.auth.logout();
        return this.handleResponse<void>(response);
    }

    async getUser() {
        const response = await this.auth.getUser();
        return this.handleResponse<User>(response);
    }

    async checkLogin(empresaId?: number) {
        const response = await this.auth.checkLogin(empresaId);
        return this.handleResponse<boolean>(response);
    }
}
