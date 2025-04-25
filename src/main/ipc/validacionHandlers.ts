import { ipcMain } from 'electron'
import { ApiService } from "../services/ApiService";
import { ValidacionService } from '../services/ValidacionService';

export function registerValidacionHandlers() {
    const apiService = ApiService.getInstance();
    const validacionService = new ValidacionService(apiService);

    ipcMain.handle('validate:bulk', async (event, data) => {
        try {
            const result = await validacionService.validarBulk(data);
            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });

}
