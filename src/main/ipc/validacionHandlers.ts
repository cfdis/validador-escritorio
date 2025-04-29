import { ipcMain } from 'electron'
import { ApiService } from "../services/ApiService";
import { ValidacionService } from '../services/ValidacionService';
import { DataEntry, QrParams, ValidacionCfdiResponseItem } from '../utils/Interfaces';
import { guardarOActualizarCfdi } from '../db/repo/cfdiRepository';

export function registerValidacionHandlers() {
    const apiService = ApiService.getInstance();
    const validacionService = new ValidacionService(apiService);

    ipcMain.handle('validate:bulk', async (_, data: QrParams[]) => {
        try {
            const result = await validacionService.validarBulk(data);

            await result.forEach(async (item: ValidacionCfdiResponseItem) => {
                const params = data.find((qrD: QrParams) => qrD.id === item.id);
                const resultado: ValidacionCfdiResponseItem = result.find((res: ValidacionCfdiResponseItem) => res.id === item.id);

                if (params && resultado) {
                    const entry: DataEntry = {
                        qrData: params,
                        result: resultado,
                    };

                    guardarOActualizarCfdi(entry);
                }

            });

            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });

    ipcMain.handle('validate:single', async (_, data: QrParams) => {
        try {
            const result = await validacionService.validar(data);

            if (result) {
                const entry: DataEntry = {
                    qrData: data,
                    result: result,
                };

                guardarOActualizarCfdi(entry);
            }

            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });

}
