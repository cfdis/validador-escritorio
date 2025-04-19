import { ipcMain } from 'electron'
import { ApiService } from "../services/ApiService";

export function registerApiHandlers() {
    const apiService = ApiService.getInstance();;

    ipcMain.handle('api:get', async (event, { endpoint, params = {} }) => {
        try {
            const result = await apiService.get(endpoint, params);
            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });

    ipcMain.handle('api:post', async (event, { endpoint, params = {}, data = {}, useAuth = true }) => {
        try {
            const result = await apiService.post(endpoint, params, data, useAuth);
            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });

    ipcMain.handle('api:put', async (event, { endpoint, params = {}, data = {} }) => {
        try {
            const result = await apiService.put(endpoint, params, data);
            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });

    ipcMain.handle('api:delete', async (event, { endpoint, params = {} }) => {
        try {
            const result = await apiService.delete(endpoint, params);
            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });

    ipcMain.handle('api:uploadFile', async (event, { endpoint, file, params = {}, data = {} }) => {
        try {
            const result = await apiService.uploadFile(endpoint, file, params, data);
            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });

    ipcMain.handle('api:uploadFileProgress', async (event, { endpoint, files, params = {}, data = {}, onProgress = null, method = null }) => {
        try {
            const result = await apiService.uploadFileProgress(endpoint, files, params, data, onProgress, method);
            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });
}