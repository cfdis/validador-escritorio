import { ipcMain } from 'electron'
import { CfdiRepository } from '../db/repo/CfdiRepository';

export function registerDbHandlers() {
    const cfdiRepo = CfdiRepository.getInstance();

    ipcMain.handle('db:cfdi:getAll', async (_) => {
        const result = await cfdiRepo.obtenerCfdis();

        return result;
    });

    ipcMain.handle('db:cfdi:delete', async (_, id: number) => {
        await cfdiRepo.eliminarCfdi(id);
    });

    ipcMain.handle('db:cfdi:deleteByUuid', async (_, uuid: string) => {
        await cfdiRepo.eliminarCfdiByUuid(uuid);
    });

    ipcMain.handle('db:cfdi:getByUuid', async (_, uuid: string) => {
        const result = await cfdiRepo.obtenerCfdiByUuid(uuid);
        return result;
    });

    ipcMain.handle('db:cfdi:getByUuids', async (_, uuids: string[]) => {
        const result = await cfdiRepo.obtenerCfdisByUuid(uuids);
        return result;
    });
}