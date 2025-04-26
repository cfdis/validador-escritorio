import { ipcMain } from 'electron'
import { eliminarCfdi, eliminarCfdiByUuid, obtenerCfdis } from '../db/repo/cfdiRepository';

export function registerDbHandlers() {
    ipcMain.handle('db:cfdi:getAll', async (event) => {
        const result = await obtenerCfdis();

        return result;
    });

    ipcMain.handle('db:cfdi:delete', async (event, id: number) => {
        await eliminarCfdi(id);
    });

    ipcMain.handle('db:cfdi:deleteByUuid', async (event, uuid: string) => {
        await eliminarCfdiByUuid(uuid);
    });
}