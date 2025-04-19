import { ToastType } from "./Types";

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
}