import { app } from "electron";
import { ApiService } from "./ApiService";
import keytar from 'keytar';

export class UserService {
    checkLoginPromise: Promise<boolean> | null = null;
    lastCheckLoginResult: boolean | null = null;
    lastCheckLoginTime = 0;
    cacheTTL = 500;
    _user: any = undefined;
    APP_NAME = '';
    // sat = null;
    // router = null;
    // _empresaPromise = undefined;
    // _empresas = {};


    private constructor(private _api: ApiService) {
        this.APP_NAME = app.getName()
        // this.sat = sat;
        // this.router = router;
    }
    private static instance: UserService | null = null;
    public static getInstance(api: ApiService): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService(api);
        }
        return UserService.instance;
    }

    public async login(email: string, password: string, remember: boolean = false) {
        const response = await this._api.post('login', {}, { email, password });
        if (response?.token) {
            await this._api.setToken(response.token, email, remember);
        }
    }

    public async loginDirect(email: string): Promise<boolean> {
        this._api.setAccount(email);
        return this.checkLogin();
    }

    public async logout(fullLogout: boolean = true): Promise<void> {
        if (fullLogout) {
            await this._api.post('logout');
        }
        await this._api.removeToken(fullLogout);
        this.reset();
    }

    public async deleteSavedUser(email: string): Promise<void> {
        try {
            this._api.setAccount(email);
            await this.logout(true);
        } catch (error) {
            await this._api.forgetToken(email);
        }
    }

    public getUser() {
        return this._user;
    }

    private setUser(u) {
        this._user = u;
        // this._empresas = {};
        // if (this._user?.empresas) {
        //     this._user.empresas.forEach(e => {
        //         if (!e) return;
        //         e.fisica = e.rfc.length === 13;
        //         e.moral = e.rfc.length === 12;
        //         this._empresas[e.id] = e;
        //     });
        // }
    }

    // addEmpresa(empresa) {
    //     empresa.fisica = empresa.rfc.length === 13;
    //     empresa.moral = empresa.rfc.length === 12;
    //     this._empresas[empresa.id] = empresa;
    // }

    // getEmpresas() {
    //     return Object.values(this._empresas);
    // }

    public checkLogin(empresaId = null): Promise<boolean> {
        const now = Date.now();
        if (this.lastCheckLoginResult !== null && (now - this.lastCheckLoginTime < this.cacheTTL)) {
            return Promise.resolve(this.lastCheckLoginResult);
        }

        if (this.checkLoginPromise) return this.checkLoginPromise;

        let params = empresaId ? { empresaId } : {};

        this.checkLoginPromise = new Promise((resolve, reject) => {
            this._api.get('check-login/full', params)
                .then(result => {
                    // const lastId = this._user?.id;
                    this.setUser(result);
                    // if (lastId && lastId !== result.id) {
                    //     location.reload();
                    //     return;
                    // }
                    // this.sat.cargarCatalogos(this._api);
                    this.lastCheckLoginResult = true;
                    resolve(true);
                })
                .catch(error => {
                    this._user = undefined;
                    if (error?.response?.status === 401) {
                        this.lastCheckLoginResult = false;
                        resolve(false);
                    } else {
                        reject(error);
                    }
                    this._api.removeToken();
                })
                .finally(() => {
                    this.lastCheckLoginTime = Date.now();
                    this.checkLoginPromise = null;
                });
        });

        return this.checkLoginPromise;
    }

    public async getSavedUsers(): Promise<Record<string, string>[]> {
        const credentials = await keytar.findCredentials(this.APP_NAME);
        const emails = credentials.map(cred => cred.account);
        const users = await this._api.post('avatars', {}, { emails: emails });
        return users.map((user: { email: any; avatar: any; }) => ({
            email: user.email,
            avatar: user.avatar || ''
        }));
    }

    // tienePrivilegios() {
    //     return this.tieneRol("ADMIN") || this.tieneRol("SUPER_ADMIN");
    // }

    // tieneRol(rol) {
    //     if (!this._user) return false;
    //     return this._user.roles?.some(r =>
    //         r.name.toLowerCase().trim() === rol.toLowerCase().trim()
    //     ) || false;
    // }

    // puede(permiso, strict = false) {
    //     if (!this._user) return false;
    //     if (!strict && this.tienePrivilegios()) return true;

    //     let allPermissions = [];

    //     this._user.roles?.forEach(r => {
    //         r.permissions?.forEach(p => {
    //             if (!allPermissions.some(ap => ap.name.toLowerCase().trim() === p.name.toLowerCase().trim())) {
    //                 allPermissions.push(p);
    //             }
    //         });
    //     });

    //     this._user.permissions?.forEach(p => {
    //         if (!allPermissions.some(ap => ap.name.toLowerCase().trim() === p.name.toLowerCase().trim())) {
    //             allPermissions.push(p);
    //         }
    //     });

    //     return allPermissions.some(p =>
    //         p.name.toLowerCase().trim() === permiso.toLowerCase().trim()
    //     );
    // }

    // listarSesiones() {
    //     return this._api.callBackend('Usuario', 'listarSesiones');
    // }

    // logoutById(id) {
    //     return new Promise((resolve, reject) => {
    //         this._api.callBackend('Usuario', 'logoutById', {}, { id })
    //             .then(response => resolve(!!response))
    //             .catch(error => {
    //                 this._api.handleError(error);
    //                 reject(error);
    //             });
    //     });
    // }

    // logoutAllOtherSessions() {
    //     this._api.callBackend('Usuario', 'logoutAll')
    //         .then(() => {
    //             location.reload();
    //         })
    //         .catch(error => {
    //             this._api.handleError(error);
    //         });
    // }

    // getEmpresa(id) {
    //     if (this._empresas[id]) {
    //         return Promise.resolve(this._empresas[id]);
    //     }

    //     if (this._empresaPromise) return this._empresaPromise;

    //     this._empresaPromise = new Promise((resolve, reject) => {
    //         this._api.get(`empresas/${id}`)
    //             .then(result => {
    //                 this.addEmpresa(result);
    //                 resolve(result);
    //             })
    //             .catch(error => {
    //                 this._api.handleError(error);
    //                 reject(error);
    //             })
    //             .finally(() => {
    //                 this._empresaPromise = undefined;
    //             });
    //     });

    //     return this._empresaPromise;
    // }

    reset() {
        this._user = undefined;
        // this._empresas = {};
        this.lastCheckLoginResult = null;
    }

    // resetEmpresas() {
    //     this._empresas = {};
    // }
}