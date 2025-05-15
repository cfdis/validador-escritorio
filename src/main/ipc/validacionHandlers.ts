import { ipcMain } from 'electron'
import { ApiService } from "../services/ApiService";
import { ValidacionService } from '../services/ValidacionService';
import { DataEntry, QrParams, ValidacionCfdiResponseItem } from '../utils/Interfaces';
import { guardarOActualizarCfdi } from '../db/repo/cfdiRepository';

export function registerValidacionHandlers() {
    const apiService = ApiService.getInstance();
    const validacionService = new ValidacionService(apiService);

    ipcMain.handle('validate:bulk', async (_, data: DataEntry[]) => {
        try {
            const result = await validacionService.validarBulk(data);

            await result.data.forEach(async (item: ValidacionCfdiResponseItem) => {
                let entry = data.find((obj: DataEntry) => obj.qrData?.id === item.id);
                const resultado: ValidacionCfdiResponseItem = result.data.find((res: ValidacionCfdiResponseItem) => res.id === item.id);

                if (entry && resultado) {
                    entry.result = resultado;

                    guardarOActualizarCfdi(entry);
                }

            });

            return apiService.getResponse(result);
        } catch (error: any) {
            return apiService.getErrorResponse(error);
        }
    });

}
