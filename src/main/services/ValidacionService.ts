import { DataEntry, QrParams } from "../utils/Interfaces";
import { ApiService } from "./ApiService";

export class ValidacionService {
    constructor(
        private api: ApiService
    ) { }

    public async validarBulk(bulkData: Array<DataEntry>) {
        const fromFile = bulkData.some(entry => entry.file !== undefined && entry.file !== null);

        let data = bulkData.map(entry => entry.qrData);
        const response = await this.api.post('validar-bulk', { from_file: fromFile ? 1 : 0 }, data);
        return response;
    }
}