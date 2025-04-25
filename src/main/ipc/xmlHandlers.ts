import { ipcMain } from 'electron'
import { XmlService } from '../services/XmlService';

export function registerXmlHandlers() {
    const xmlService = new XmlService();

    ipcMain.handle('xml:preProcess', async (event, xmlString: string) => {
        try {
            const result = await xmlService.preProcessXml(xmlString);
            return result;
        } catch (error: any) {
            return null;
        }
    });
}