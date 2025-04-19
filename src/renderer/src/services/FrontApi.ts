import { ApiErrorDetails } from "../utils/Interfaces";
import { ToastService } from "./ToastService";

export class FrontApi {
    constructor(
        protected ts: ToastService,
    ) { }

    protected async handleResponse<T>(response: any): Promise<T> {
        if (response.success) {
            return response.data;
        }

        throw response.data as ApiErrorDetails;
    }

    private handleApiError(error: any) {
        console.error('Error FrontApi:', error);
        this.ts.error('Error en la aplicación.', 'Error desconocido. Por favor contácta al soporte técnico.');
    }

    public handleError(error: ApiErrorDetails) {
        if (typeof error === 'string') {
            return this.handleApiError(error);
        }

        if (error.status === 0) {
            this.ts.error('No hay conexión con el servidor', error.message);
        } else if (error.status === 401) {
            this.ts.error('No Autorizado', error.message);
        } else if (error.status === 403) {
            this.ts.error('Acceso Denegado', error.message);
        } else if (error.status >= 400 && error.status <= 499) {
            this.ts.error('Error en la solicitud', error.message);
        } else if (error.status >= 500 && error.status <= 599) {
            this.ts.error('Error del servidor', error.message);
        } else {
            this.ts.error('Error desconocido', error.message);
        }
    }
}