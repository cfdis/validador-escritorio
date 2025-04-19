import { ipcMain } from 'electron'
import { ApiService } from "../services/ApiService";
import { UserService } from '../services/UserService';

export function registerAuthHandlers() {
    const apiService = ApiService.getInstance();
    const userService = new UserService(apiService);

    ipcMain.handle('auth:login', async (event, { username, password }) => {
        try {
            const result = await userService.login(username, password);
            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });

    ipcMain.handle('auth:logout', async (event) => {
        try {
            const result = await userService.logout();
            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });

    ipcMain.handle('auth:getUser', async (event) => {
        try {
            const result = await userService.getUser();
            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });

    ipcMain.handle('auth:checkLogin', async (event, empresaId?) => {
        try {
            const result = await userService.checkLogin(empresaId);
            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });
}
