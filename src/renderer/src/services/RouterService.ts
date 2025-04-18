// src/router/RouterService.ts
import { InitFunction } from "../utils/Types";

export class RouterService {
    private containerId: string;
    private currentView: string | null = null;
    private routes: Record<string, InitFunction>;
    private userService: any;
    private apiService: any;

    constructor(
        userService: any,
        apiService: any,
        routes: Record<string, InitFunction>,
        containerId = 'app'
    ) {
        this.containerId = containerId;
        this.routes = routes;
        this.userService = userService;
        this.apiService = apiService;
    }

    async navigate(viewName: string, params: any = {}) {
        try {
            const isLoggedIn = await this.userService.checkLogin();

            if (isLoggedIn) {
                await this._loadView(viewName, params);
            } else {
                await this._loadView('login');
            }
        } catch (err: any) {
            console.error('Error login:', err);
            if (err.status === 0) {
                await this._loadView('offline');
            } else {
                await this._loadView('login');
                this.apiService.handleError(err);
            }
        }
    }

    private async _loadView(viewName: string, params: any = {}) {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        try {
            let htmlPath = `/views/${viewName}.html`; // Debes asegurarte que views/ esté en public/

            const response = await fetch(htmlPath);
            if (!response.ok) {
                htmlPath = `/views/404.html`; // Cambia a la vista de error 404 si no se encuentra la vista
            }

            const html = await fetch(htmlPath).then((res) => res.text());
            container.innerHTML = html;
            this.currentView = viewName;

            const init = this.routes[viewName];
            if (typeof init === 'function') {
                init(params);
            } else {
                console.warn(`No init function for view "${viewName}"`);
            }
        } catch (error) {
            console.error(`Error al cargar la vista "${viewName}"`, error);
            container.innerHTML = `<p>Error al cargar vista: ${viewName}</p>`;
        }
    }

    getCurrentView() {
        return this.currentView;
    }

    async start(initialView = 'dashboard') {
        await this.navigate(initialView);
    }
}
