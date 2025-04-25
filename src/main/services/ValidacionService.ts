import { ApiService } from "./ApiService";

export class ValidacionService {
    constructor(
        private api: ApiService
    ) { }

    public async validarBulk(bulkData: Array<any>) {
        const response = await this.api.post('validarp', {}, bulkData);
        return response;
    }
}