import { QrParams, ToastType } from "./Types";

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

export interface ToastConfig {
    title?: string;
    message: string;
    type?: ToastType;
    icon?: string; // Optional icon HTML or class name
    fullWidth?: boolean;
    autoHide?: boolean;
    duration?: number; // ms
    closeable?: boolean;
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

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    // permissions?: Permiso[];
    // empresas?: { [k: string]: Empresa };
    // roles?: Role[];
    email_verified_at: string | null;
    suscripciones_validador: SuscripcionValidador[]
    validaciones_restantes?: number;
}

export interface SuscripcionValidador {
    id: number;
    plan_validador_id: number;
    user_id?: number;
    tarjeta_id?: number;
    provider?: string;
    subscription_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    trial_end?: string;
    cancellation_date?: string;
    cancellation_reason: string;
    extra: SuscripcionDetalles;
    created_at: string;
    updated_at: string;
    plan_validador?: PlanValidador;
}

export interface SuscripcionDetalles {
    charge_id?: string;
    customer_id?: string;
    last_order_id?: string;
    reject_reason?: string;
    billing_cycle_end?: string;
}

export interface PlanValidador {
    id: number;
    name: string;
    amount: number;
    interval: string;
}

export interface ValidacionCfdiResult {
    CodigoEstatus: string;
    EsCancelable: string;
    Estado: string;
    EstatusCancelacion: string;
    ValidacionEFOS: string;
    UltimaFechaConsulta: string; // ISO 8601, e.g. "2025-04-24T12:59:04"
}

export interface ValidacionCfdiResponseItem {
    id: string;
    resultado?: ValidacionCfdiResult;
    error?: string;
}

export interface DataEntry {
    file?: File;
    qrData: QrParams | null;
    result?: ValidacionCfdiResponseItem | null;
}