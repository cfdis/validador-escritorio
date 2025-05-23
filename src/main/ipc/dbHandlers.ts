import { ipcMain } from 'electron'
import { eliminarCfdi, eliminarCfdiByUuid, obtenerCfdiByUuid, obtenerCfdis, obtenerCfdisByUuid } from '../db/repo/cfdiRepository';

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

    ipcMain.handle('db:cfdi:getByUuid', async (_, uuid: string) => {
        const result = await obtenerCfdiByUuid(uuid);
        return result;
    });

    ipcMain.handle('db:cfdi:getByUuids', async (_, uuids: string[]) => {
        const result = await obtenerCfdisByUuid(uuids);
        return result;
    });
}