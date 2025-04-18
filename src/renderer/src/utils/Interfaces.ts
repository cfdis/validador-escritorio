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