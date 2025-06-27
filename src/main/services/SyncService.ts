import { ApiService } from "./ApiService";
import { UserRepository } from "../db/repo/UserRepository";
import { CfdiRepository } from "../db/repo/CfdiRepository";
import { DataEntry, SyncResponseItem, SyncPaginatedResponse } from "../utils/Interfaces";

export class SyncService {
    private static instance: SyncService | null = null;
    private userRepo = UserRepository.getInstance();
    private cfdiRepo = CfdiRepository.getInstance();
    private api = ApiService.getInstance();
    private syncInterval: NodeJS.Timeout | null = null;
    private currentUserId: number | null = null;

    private constructor() { }

    public static getInstance(): SyncService {
        if (!SyncService.instance) {
            SyncService.instance = new SyncService();
        }
        return SyncService.instance;
    }

    public startSync(userId: number): void {
        this.currentUserId = userId;
        this.stopSync(); // Detener cualquier sincronización anterior

        // Ejecutar inmediatamente
        this.performSync();

        // Programar ejecución cada hora (3600000 ms)
        this.syncInterval = setInterval(() => {
            this.performSync();
        }, 3600000);
    }

    public stopSync(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    private async performSync(): Promise<void> {
        if (!this.currentUserId) return;

        try {
            const lastSync = await this.userRepo.getLastSyncDate(this.currentUserId);
            let page = 1;
            let hasMorePages = true;

            while (hasMorePages) {
                const response: SyncPaginatedResponse = await this.api.post('sync', {
                    last_sync: lastSync,
                    page: page
                });

                if (response?.data && Array.isArray(response.data)) {
                    // Procesar los resultados de esta página
                    await this.processSyncData(response.data);

                    // Actualizar la fecha de última sincronización después de cada página exitosa
                    await this.userRepo.updateLastSync(
                        this.currentUserId,
                        new Date().toISOString()
                    );

                    // Verificar si hay más páginas
                    hasMorePages = response.current_page < response.last_page;
                    page++;
                } else {
                    hasMorePages = false;
                }
            }
        } catch (error) {
            console.error('Error durante la sincronización:', error);
        }
    } private async processSyncData(data: SyncResponseItem[]): Promise<void> {
        for (const item of data) {
            try {
                // Crear un DataEntry usando los params recibidos del backend
                const entry: DataEntry = {
                    qrData: item.params, // Usar los params que vienen del backend
                    file: undefined,
                    result: {
                        id: item.uuid, // Usar uuid como id
                        resultado: item.resultado.ConsultaResult,
                    }
                };

                // Guardar o actualizar el CFDI
                await this.cfdiRepo.guardarOActualizarCfdi(entry, this.currentUserId!);
            } catch (error) {
                console.error('Error procesando item de sincronización:', error);
            }
        }
    }
}