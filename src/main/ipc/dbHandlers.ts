import { ipcMain } from 'electron'
import { CfdiRepository } from '../db/repo/CfdiRepository';
import { UserService } from '../services/UserService';
import { ApiService } from '../services/ApiService';

export function registerDbHandlers() {
    const cfdiRepo = CfdiRepository.getInstance();
    const apiService = ApiService.getInstance();
    const userService = UserService.getInstance(apiService);

    ipcMain.handle('db:cfdi:getAll', async (_) => {
        const userId = userService.getUser()?.id;
        if (!userId) return [];
        
        const result = await cfdiRepo.obtenerCfdis(userId);
        return result;
    });

    ipcMain.handle('db:cfdi:delete', async (_, id: number) => {
        const userId = userService.getUser()?.id;
        if (!userId) return;
        
        await cfdiRepo.eliminarCfdi(id, userId);
    });

    ipcMain.handle('db:cfdi:deleteByUuid', async (_, uuid: string) => {
        const userId = userService.getUser()?.id;
        if (!userId) return;
        
        await cfdiRepo.eliminarCfdiByUuid(uuid, userId);
    });

    ipcMain.handle('db:cfdi:getByUuid', async (_, uuid: string) => {
        const userId = userService.getUser()?.id;
        if (!userId) return null;
        
        const result = await cfdiRepo.obtenerCfdiByUuid(uuid, userId);
        return result;
    });

    ipcMain.handle('db:cfdi:getByUuids', async (_, uuids: string[]) => {
        const userId = userService.getUser()?.id;
        if (!userId) return [];
        
        const result = await cfdiRepo.obtenerCfdisByUuid(uuids, userId);
        return result;
    });
}