import $ from "jquery";
import { View } from "../interfaces/View";
import { routes } from "../routes/Router";
import { RouteDeps, Routes } from "../utils/Types";
import { FrontApiService } from "./FrontApiService";
import { FrontUserService } from "./FrontUserService";
// import { ApiErrorDetails, User } from "../utils/Interfaces";

export class RouterService {
    private containerId: string;
    private currentView: string | null = null;
    private currentInstance: View | null = null;
    private userService: FrontUserService | null = null;
    private apiService: FrontApiService | null = null;
    private routes: Routes;
    private deps: RouteDeps | null = null;
    private isInitialized = false;

    private isLoggedIn = false;
    private user: any = null;

    constructor(
        containerId = 'app'
    ) {
        this.containerId = containerId;
        this.routes = routes;
    }

    public async init(deps: RouteDeps, initialView: string = 'dashboard') {
        this.deps = deps
        this.userService = deps.us;
        this.apiService = deps.api;

        this.isInitialized = true;

        await this.navigate(initialView);
    }

    async navigate(viewName: string, params: any = {}) {
        if (!this.isInitialized) {
            console.error('RouterService not initialized. Call init(deps) first.');
            return;
        }

        try {
            this.isLoggedIn = await this.userService!.checkLogin();

            if (this.isLoggedIn) {
                this.user = await this.userService!.getUser();
                const proViews = ['scanFile'];

                if (!this.user.suscripciones_validador.length && proViews.includes(viewName)) {
                    viewName = 'suscripcion';
                }

                await this._loadView(viewName, params);
            } else {
                this.user = null;
                await this._loadView('login');
            }
        } catch (err: any) {
            console.error('Error login:', err);
            if (err.status === 0) {
                await this._loadView('offline');
            } else {
                await this._loadView('login');
                this.apiService!.handleError(err);
            }
        }
    }

    private async _loadView(viewName: string, params: any = {}) {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        try {
            if (this.currentInstance && this.currentInstance.destroy) {
                this.currentInstance.destroy();
            }

            let htmlPath = `views/${viewName}.html`;

            const response = await fetch(htmlPath);
            if (!response.ok) {
                htmlPath = `views/404.html`; // Cambia a la vista de error 404 si no se encuentra la vista
            }

            const html = await fetch(htmlPath).then((res) => res.text());
            container.innerHTML = html;
            this.currentView = viewName;

            const viewsWithoutMenu = ['login', 'offline', '404', 'dashboard'];

            if (!viewsWithoutMenu.includes(viewName)) {
                $('#navDropdownContainer').show();
            } else {
                $('#navDropdownContainer').hide();
            }

            $('.pro-tag').toggle(!this.user?.suscripciones_validador.length);

            const factory = this.routes[viewName];
            if (typeof factory === 'function') {
                const instance = factory(this.deps!);
                this.currentInstance = instance;
                instance.init(params);
            }
        } catch (error) {
            console.error(`Error al cargar la vista "${viewName}"`, error);
            container.innerHTML = `<p>Error al cargar vista: ${viewName}</p>`;
        }
    }

    // private loadUser() {
    //     this.userService!.getUser().then((user: User) => {
    //         if (user && !$('#userMenu').is(':visible')) {
    //             $('#userName').text(user.name || 'Usuario');
    //             $('#userEmail').text(user.email || '');
    //             $('#userAvatar').attr('src', user.avatar || 'assets/img/default-user.jpg');
    //             $('#userMenu').show();
    //         }
    //     }).catch((error: ApiErrorDetails) => {
    //         this.userService!.handleError(error);
    //     });
    // }

    getCurrentView() {
        return this.currentView;
    }
}
