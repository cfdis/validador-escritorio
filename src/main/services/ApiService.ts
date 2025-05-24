import axios, { AxiosProgressEvent, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiErrorDetails, ApiResponse, LaravelException } from '../utils/Interfaces';
import { is } from '@electron-toolkit/utils';
import keytar from 'keytar';

export class ApiService {
    environment: any = null;
    SERVICE = 'validador_cfdi_app';
    ACCOUNT = 'current_user';

    private constructor() {
        this.environment = {
            apiUrl: is.dev ? 'http://localhost:8080/validador/' : 'https://facturabilidad.com/validador/',
            frontUrl: is.dev ? 'http://localhost:8080/app/' : 'https://facturabilidad.com/app/',
        };
    }

    private static instance: ApiService | null = null;
    public static getInstance(): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    // Establece el token JWT. (usualmente desde el userService)
    public async setToken(token: string): Promise<void> {
        await keytar.setPassword(this.SERVICE, this.ACCOUNT, token);
    }

    // Cuando se cierra la sesión, se elimina el token.
    public async removeToken(): Promise<void> {
        await keytar.deletePassword(this.SERVICE, this.ACCOUNT);
    }

    // Obtiene el token JWT.
    private async getJwtToken(): Promise<string | null> {
        return await keytar.getPassword(this.SERVICE, this.ACCOUNT);
    }

    // Configura los encabezados para la petición.
    private getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }

    private async createAuthHeaders() {
        const token = await this.getJwtToken();
        return {
            ...this.getHeaders(),
            Authorization: `Bearer ${token}`,
        };
    }

    // Realiza una solicitud GET.
    async get(endpoint: string, urlParams: any = {}) {
        const path = endpoint.replace(/^\//, '');
        const headers = await this.createAuthHeaders();

        const config: AxiosRequestConfig = {
            method: 'GET',
            url: `${this.environment.apiUrl}${path}`,
            headers,
            params: urlParams,
        };

        try {
            const response: AxiosResponse = await axios(config);
            return response.data;
        } catch (error) {
            // console.error('Error en la solicitud GET:', error);
            throw error;
        }
    }

    // Realiza una solicitud POST.
    async post(endpoint: string, urlParams: any = {}, data: any = {}, useAuth: boolean = true) {
        endpoint = endpoint.replace(/^\//, '');
        const headers = useAuth ? await this.createAuthHeaders() : this.getHeaders();

        const config: AxiosRequestConfig = {
            method: 'POST',
            url: `${this.environment.apiUrl}${endpoint}`,
            headers,
            params: urlParams,
            data: data,
        };

        try {
            const response: AxiosResponse = await axios(config);
            return response.data;
        } catch (error) {
            // console.error('Error en la solicitud POST:', error);
            throw error;
        }
    }

    // Realiza una solicitud PUT.
    async put(endpoint: string, urlParams: any = {}, data: any = {}) {
        endpoint = endpoint.replace(/^\//, '');
        const headers = await this.createAuthHeaders();

        const config: AxiosRequestConfig = {
            method: 'PUT',
            url: `${this.environment.apiUrl}${endpoint}`,
            headers,
            params: urlParams,
            data: data,
        };

        try {
            const response: AxiosResponse = await axios(config);
            return response.data;
        } catch (error) {
            // console.error('Error en la solicitud PUT:', error);
            throw error;
        }
    }

    // Realiza una solicitud DELETE.
    async delete(endpoint: string, urlParams: any = {}) {
        endpoint = endpoint.replace(/^\//, '');
        const headers = await this.createAuthHeaders();

        const config: AxiosRequestConfig = {
            method: 'DELETE',
            url: `${this.environment.apiUrl}${endpoint}`,
            headers,
            params: urlParams,
        };

        try {
            const response: AxiosResponse = await axios(config);
            return response.data;
        } catch (error) {
            // console.error('Error en la solicitud GET:', error);
            throw error;
        }
    }

    // Subir archivo al servidor.
    async uploadFile(endpoint: string, file: File | File[], urlParams: any = {}, data: any = {}) {
        endpoint = endpoint.replace(/^\//, '');

        let formData = new FormData();
        for (let d in data) {
            formData.append(d, data[d]);
        }

        if (file instanceof File) {
            formData.append('file', file, file.name);
        } else {
            for (let f in file) {
                formData.append(f, file[f], file[f].name);
            }
        }

        const token = await this.getJwtToken();

        const config: AxiosRequestConfig = {
            method: 'POST',
            url: `${this.environment.apiUrl}${endpoint}`,
            headers: {
                'Accept': 'application/json',
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            data: formData,
            params: urlParams,
            // withCredentials: true,
        }

        try {
            const response: AxiosResponse = await axios(config);
            return response.data;
        }
        catch (error) {
            // console.error('Error al subir archivos:', error);
            throw error;
        }
    }

    async uploadFileProgress(
        endpoint: string,
        files: File | { [key: string]: File },
        urlParams: { [key: string]: any } = {},
        data: { [key: string]: string } = {},
        onProgress?: (progress: number) => void,
        method?: string, // Ej: 'PUT' si usas _method en el FormData
    ): Promise<any> {
        endpoint = endpoint.replace(/^\//, '');
        const formData = new FormData();

        if (method) {
            formData.append('_method', method);
        }

        for (let key in data) {
            formData.append(key, data[key]);
        }

        if (files instanceof File) {
            formData.append('file', files, files.name);
        } else {
            for (let key in files) {
                const file = files[key];
                if (!(file instanceof File)) continue;
                formData.append(key, file, file.name);
            }
        }

        const token = await this.getJwtToken();

        const config: AxiosRequestConfig = {
            method: 'POST',
            url: `${this.environment.apiUrl}${endpoint}`,
            headers: {
                'Accept': 'application/json',
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            data: formData,
            params: urlParams,
            // withCredentials: true,
        }

        // Si se proporciona un manejador de progreso, lo añadimos a la configuración
        if (onProgress) {
            config.onUploadProgress = (event: AxiosProgressEvent) => {
                if (event.lengthComputable) {
                    const percentCompleted = Math.round((event.loaded * 100) / (event.total || 100));
                    onProgress(percentCompleted);
                }
            };
        }

        try {
            const response: AxiosResponse = await axios(config);
            return response.data;
        }
        catch (error) {
            // console.error('Error al subir archivos:', error);
            throw error;
        }
    }

    public getResponse(result: any): ApiResponse<any> {
        return {
            success: true,
            data: result
        };
    }

    public getErrorResponse(error: any): ApiResponse<ApiErrorDetails> {
        let er: string;
        if (error?.response?.data === undefined) {
            er = '';
        } else if (typeof error.response.data === 'string') {
            // Si error.error es una cadena HTML
            er = error.response.data;
        } else if ('message' in error.response.data) {
            let LaravelException = error?.response?.data as LaravelException;
            er = LaravelException.message;
        } else {
            er = 'Error desconocido';
        }

        const code = error?.response?.data?.code ?? error?.cause?.code ?? 'UNKNOWN';
        const status = error?.response?.status ?? 0;
        const statusText = error?.response?.statusText ?? null;

        return {
            success: false,
            data: {
                message: er,
                status: status,
                code: code,
                statusText: statusText,
            }
        }
    }

    public async openExternal(endpoint: string): Promise<void> {
        const url = `${this.environment.frontUrl}${endpoint}`;
        const { shell } = require('electron');
        await shell.openExternal(url);
    }
}