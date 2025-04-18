import $ from 'jquery';
import { LaravelException } from '../utils/Interfaces';

export class ApiService {
    environment = null;
    authApi = null;

    constructor() {
        this.environment = {
            apiUrl: 'http://localhost:8080/validador/' // Cambia esto a la URL de tu API
            // apiUrl: 'https://facturabilidad.com/' // Cambia esto a la URL de tu API
        };
        this.authApi = window.auth;

        // this.getJwtToken(); // Inicializa la obtención del CSRF Token.
    }

    // Obtiene el token CSRF.
    private async getJwtToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.authApi.getToken()
                .then((token: string) => {
                    if (!token) {
                        resolve('');
                        return;
                    }
                    resolve(token);
                })
                .catch((err: any) => {
                    reject(err);
                });
        });
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

        return this.createAuthHeaders().then((headers) => {

            return $.ajax({
                url: `${this.environment.apiUrl}${path}`,
                method: 'GET',
                data: urlParams,
                headers: headers,
                xhrFields: {
                    withCredentials: true,
                },
            });
        }).catch((error) => {
            console.error('Error en la solicitud GET:', error);
            return Promise.reject(error);
        });
    }

    // Realiza una solicitud POST.
    async post(endpoint: string, urlParams: any = {}, data: any = {}) {
        endpoint = endpoint.replace(/^\//, '');

        return this.createAuthHeaders()
            .then((headers) => {
                return $.ajax({
                    url: `${this.environment.apiUrl}${endpoint}`,
                    method: 'POST',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    dataType: 'json',
                    headers: headers,
                    xhrFields: {
                        withCredentials: true,
                    },
                });
            })
            .catch((error) => {
                console.error('Error en la solicitud POST:', error);
                return Promise.reject(error);
            });
    }

    // Realiza una solicitud PUT.
    async put(endpoint: string, urlParams: any = {}, data: any = {}) {
        endpoint = endpoint.replace(/^\//, '');

        return this.createAuthHeaders()
            .then((headers) => {
                return $.ajax({
                    url: `${this.environment.apiUrl}${endpoint}`,
                    method: 'PUT',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    dataType: 'json',
                    headers: headers,
                    xhrFields: {
                        withCredentials: true,
                    },
                });
            })
            .catch((error) => {
                console.error('Error en la solicitud PUT:', error);
                return Promise.reject(error);
            });
    }

    // Realiza una solicitud DELETE.
    async delete(endpoint: string, urlParams: any = {}) {
        endpoint = endpoint.replace(/^\//, '');

        return this.createAuthHeaders()
            .then((headers) => {
                return $.ajax({
                    url: `${this.environment.apiUrl}${endpoint}`,
                    method: 'DELETE',
                    data: urlParams,
                    headers: headers,
                    xhrFields: {
                        withCredentials: true,
                    },
                });
            })
            .catch((error) => {
                console.error('Error en la solicitud DELETE:', error);
                return Promise.reject(error);
            });
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

        return this.getJwtToken()
            .then((token) => {
                return $.ajax({
                    url: `${this.environment.apiUrl}${endpoint}`,
                    method: 'POST',
                    data: formData,
                    contentType: false,
                    processData: false,
                    headers: {
                        'X-XSRF-TOKEN': token,
                    },
                    xhrFields: {
                        withCredentials: true,
                    },
                });
            })
            .catch((error) => {
                console.error('Error al subir archivo:', error);
                return Promise.reject(error);
            });
    }

    async uploadFileProgress(
        endpoint: string,
        files: File | { [key: string]: File },
        urlParams: { [key: string]: any } = {},
        data: { [key: string]: string } = {},
        onProgress?: (event: ProgressEvent) => void,
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

        const queryString = new URLSearchParams(urlParams).toString();
        const url = `${this.environment.apiUrl}${endpoint}${queryString ? '?' + queryString : ''}`;

        return this.getJwtToken().then(token => {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.open('POST', url, true);
                xhr.withCredentials = true;

                xhr.setRequestHeader('X-XSRF-TOKEN', token);

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const responseJson = JSON.parse(xhr.responseText);
                            resolve(responseJson);
                        } catch (e) {
                            resolve(xhr.responseText);
                        }
                    } else {
                        reject({
                            status: xhr.status,
                            message: xhr.statusText,
                            response: xhr.responseText
                        });
                    }
                };

                xhr.onerror = () => {
                    reject({
                        status: xhr.status,
                        message: xhr.statusText
                    });
                };

                // Manejador de progreso (si se proporcionó)
                if (xhr.upload && onProgress) {
                    xhr.upload.onprogress = onProgress;
                }

                xhr.send(formData);
            });
        });
    }


    // Maneja los errores de las solicitudes.
    handleError(error: any) {
        let er: string;
        if (typeof error.error === 'string') {
            // Si error.error es una cadena HTML
            er = error.message;
        } else if ('message' in error.error) {
            let LaravelException = error.error as LaravelException;
            er = LaravelException.message;

        } else {
            er = error.error.error ?? JSON.stringify(error.error);
        }

        let errorShown = error.message || error.responseJSON.message || error.responseJSON.error || er;

        if (error.status === 0) {
            alert(`No hay conexión con el servidor. ${errorShown}`);
        } else if (error.status === 401) {
            alert('No Autorizado: ' + errorShown);
        } else if (error.status === 403) {
            alert('Acceso Denegado: ' + errorShown);
        } else if (error.status >= 400 && error.status <= 499) {
            alert('Error en la solicitud: ' + errorShown);
        } else if (error.status >= 500 && error.status <= 599) {
            alert('El equipo de soporte ha sido notificado. Contáctanos para dar seguimiento. Error del servidor: ' + errorShown);
        } else {
            alert('Error desconocido: ' + errorShown);
        }
        console.log('Error en la solicitud:', error);
    }
}