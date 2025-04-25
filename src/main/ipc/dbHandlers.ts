import { ipcMain } from 'electron'
import { obtenerCfdis } from '../db/repo/cfdiRepository';

export function registerDbHandlers() {
    ipcMain.handle('db:cfdi:all', async (event) => {
        const result = await obtenerCfdis();

        return result;
    });
}