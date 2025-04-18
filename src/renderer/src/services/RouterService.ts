import { View } from "../interfaces/View";
import { routes } from "../routes/Router";
import { RouteDeps, Routes } from "../utils/Types";

export class RouterService {
    private containerId: string;
    private currentView: string | null = null;
    private currentInstance: View | null = null;
    private userService: any;
    private apiService: any;
    private routes: Routes;
    private deps: RouteDeps;

    private isInitialized = false;

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
            if (this.currentInstance) {
                this.currentInstance.destroy();
            }

            let htmlPath = `/views/${viewName}.html`; // Debes asegurarte que views/ esté en public/

            const response = await fetch(htmlPath);
            if (!response.ok) {
                htmlPath = `/views/404.html`; // Cambia a la vista de error 404 si no se encuentra la vista
            }

            const html = await fetch(htmlPath).then((res) => res.text());
            container.innerHTML = html;
            this.currentView = viewName;

            const factory = this.routes[viewName];
            if (typeof factory === 'function') {
                const instance = factory(this.deps);
                this.currentInstance = instance;
                instance.init(params);
            }
        } catch (error) {
            console.error(`Error al cargar la vista "${viewName}"`, error);
            container.innerHTML = `<p>Error al cargar vista: ${viewName}</p>`;
        }
    }

    getCurrentView() {
        return this.currentView;
    }
}
