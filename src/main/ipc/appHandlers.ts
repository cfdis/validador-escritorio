import { app, ipcMain } from "electron";

export function registerAppHandlers() {
    ipcMain.handle('app:version', async () => {
        return app.getVersion();
    });
}