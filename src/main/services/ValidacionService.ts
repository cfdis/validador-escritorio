import { QrParams } from "../utils/Interfaces";
import { ApiService } from "./ApiService";

export class ValidacionService {
    constructor(
        private api: ApiService
    ) { }

    public async validarBulk(bulkData: Array<QrParams>) {
        const response = await this.api.post('validarp', {}, bulkData);
        return response;
    }

    public async validar(data: QrParams) {
        const response = await this.api.post('validar', {}, data);
        return response;
    }
}