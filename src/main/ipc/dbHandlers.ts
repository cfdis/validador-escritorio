import { ipcMain } from 'electron'
import { eliminarCfdi, eliminarCfdiByUuid, obtenerCfdis } from '../db/repo/cfdiRepository';

export function registerDbHandlers() {
    ipcMain.handle('db:cfdi:getAll', async (_) => {
        const result = await obtenerCfdis();

        return result;
    });

    ipcMain.handle('db:cfdi:delete', async (_, id: number) => {
        await eliminarCfdi(id);
    });

    ipcMain.handle('db:cfdi:deleteByUuid', async (_, uuid: string) => {
        await eliminarCfdiByUuid(uuid);
    });
}