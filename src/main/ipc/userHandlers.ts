import { ipcMain } from 'electron'
import { ApiService } from "../services/ApiService";
import { UserService } from '../services/UserService';

export function registerAuthHandlers() {
    const apiService = ApiService.getInstance();
    const userService = UserService.getInstance(apiService);

    ipcMain.handle('auth:login', async (_, { username, password, remember }) => {
        try {
            const result = await userService.login(username, password, remember);
            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });

    ipcMain.handle('auth:logout', async (_, fullLogout: boolean) => {
        try {
            const result = await userService.logout(fullLogout);
            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });

    ipcMain.handle('auth:getUser', async (_) => {
        try {
            const result = await userService.getUser();
            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });

    ipcMain.handle('auth:checkLogin', async (_, empresaId?) => {
        try {
            const result = await userService.checkLogin(empresaId);
            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });

    ipcMain.handle('auth:getSavedUsers', async (_) => {
        try {
            const result = await userService.getSavedUsers();
            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });

    ipcMain.handle('auth:loginDirect', async (_, email) => {
        try {
            const result = await userService.loginDirect(email);
            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });

    ipcMain.handle('auth:deleteSavedUser', async (_, email) => {
        try {
            const result = await userService.deleteSavedUser(email);
            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });
}
