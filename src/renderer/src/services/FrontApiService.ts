import { FrontApi } from './FrontApi';
import { ToastService } from './ToastService';

export class FrontApiService extends FrontApi {
    private api: typeof window.api;

    constructor(
        protected ts: ToastService,
    ) {
        super(ts);
        this.api = window.api;
    }

    async get<T>(endpoint: string, params: any = {}) {
        const response = await this.api.get(endpoint, params);
        return this.handleResponse<T>(response);
    }

    async post<T>(endpoint: string, data: any = {}, params: any = {}) {
        const response = await this.api.post(endpoint, params, data);
        return this.handleResponse<T>(response);
    }

    async put<T>(endpoint: string, data: any = {}, params: any = {}) {
        const response = await this.api.put(endpoint, params, data);
        return this.handleResponse<T>(response);
    }

    async delete<T>(endpoint: string, params: any = {}) {
        const response = await this.api.delete(endpoint, params);
        return this.handleResponse<T>(response);
    }

    async uploadFile<T>(endpoint: string, filePath: string, data: any = {}) {
        const response = await this.api.uploadFile(endpoint, filePath, data);
        return this.handleResponse<T>(response);
    }

    async uploadFileProgress<T>(endpoint: string, files: any, params: any = {}, data: any = {}, onProgress?: any, method?: string) {
        const response = await this.api.uploadFileProgress(endpoint, files, params, data, onProgress, method);
        return this.handleResponse<T>(response);
    }
}
