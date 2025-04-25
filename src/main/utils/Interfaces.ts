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