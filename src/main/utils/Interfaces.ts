export interface LaravelException {
    message: string;
    exception: string;
    file: string;
    line: number;
    trace: LaravelTrace[];
}

interface LaravelTrace {
    file: string;
    line: number;
    function: string;
    class?: string;
    type?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
}

export interface ApiErrorDetails {
    message: string;
    status: number;
    statusText?: string;
    code?: string;
}

export type QrParams = {
    id: string;
    re: string;
    rr: string;
    tt: string;
    fe: string;
    xml?: string;
}

export interface ValidacionCfdiResult {
    CodigoEstatus: string;
    EsCancelable: string;
    Estado: string;
    EstatusCancelacion: string;
    ValidacionEFOS: string;
    UltimaFechaConsulta: string;
}

export interface DataEntry {
    file?: File;
    qrData: QrParams | null;
    result?: ValidacionCfdiResponseItem | null;
}

export interface ValidacionCfdiResponseItem {
    id: string;
    resultado?: ValidacionCfdiResult;
    error?: string;
}

export interface SyncResponseItem {
    uuid: string; // UUID del CFDI
    params: QrParams; // Parámetros QR generados en el backend
    emisor_rfc: string;
    receptor_rfc: string;
    estado: string;
    created_at: string;
    updated_at: string;
    pivot?: any; // Información de pivot de la relación muchos a muchos
    resultado: {
        ConsultaResult: ValidacionCfdiResult;
    }
}

export interface SyncPaginatedResponse {
    current_page: number;
    data: SyncResponseItem[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}