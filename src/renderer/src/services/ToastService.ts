import $ from 'jquery';
import { ToastConfig } from '../utils/Interfaces';
import { ToastType } from '../utils/Types';

export class ToastService {
    private containerId = 'toast-container';
    private defaultConfig: ToastConfig = {
        autoHide: true,
        duration: 3000,
        fullWidth: false,
        closeable: true,
        message: '',
    };

    constructor() {
        this.ensureContainer();
    }

    public setConfig(config: Partial<ToastConfig>) {
        this.defaultConfig = { ...this.defaultConfig, ...config };
    }

    private ensureContainer() {
        if ($('#' + this.containerId).length === 0) {
            $('body').append(`<div id="${this.containerId}" class="fixed top-6 right-6 z-50 space-y-2 w-full max-w-sm"></div>`);
        }
    }

    public success(title: string, message: string, extra?: Partial<ToastConfig>) {
        this.show({ ...extra, type: 'success', title, message });
    }

    public info(title: string, message: string, extra?: Partial<ToastConfig>) {
        this.show({ ...extra, type: 'info', title, message });
    }

    public warning(title: string, message: string, extra?: Partial<ToastConfig>) {
        this.show({ ...extra, type: 'warning', title, message });
    }

    public error(title: string, message: string, extra?: Partial<ToastConfig>) {
        this.show({ ...extra, type: 'error', title, message });
    }

    public show(config: ToastConfig) {
        const mergedConfig = { ...this.defaultConfig, ...config };
        const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const titleHtml = mergedConfig.title ? `<div class="font-bold">${mergedConfig.title}</div>` : '';
        const closeBtnHtml = mergedConfig.closeable ? `<button class="absolute btn top-1 right-2 text-lg leading-none" data-close="${id}">&times;</button>` : '';
        const widthClass = mergedConfig.fullWidth ? 'w-full max-w-none' : 'max-w-sm';

        const typeClass = this.getTypeClass(mergedConfig.type);
        const iconHtml = mergedConfig.icon ? `<i class="mr-2 material-icons">${mergedConfig.icon}</i>` : '';

        const toastHtml = `
            <div id="${id}" class="relative ${typeClass} text-white px-4 py-2 rounded-lg shadow-lg ${widthClass} min-w-sm animate-fade-in">
                ${closeBtnHtml}
                <div class="flex items-start">
                    ${iconHtml}
                    <div>
                        ${titleHtml}
                        <div>${mergedConfig.message}</div>
                    </div>
                </div>
            </div>
        `;

        $('#' + this.containerId).append(toastHtml);

        if (mergedConfig.closeable) {
            $(`[data-close='${id}']`).on('click', () => {
                $('#' + id).fadeOut(300, () => $('#' + id).remove());
            });
        }

        if (mergedConfig.autoHide !== false) {
            const duration = mergedConfig.duration ?? 2000;
            setTimeout(() => {
                $('#' + id).fadeOut(300, () => $('#' + id).remove());
            }, duration);
        }
    }

    private getTypeClass(type?: ToastType): string {
        switch (type) {
            case 'error':
                return 'bg-red-600';
            case 'warning':
                return 'bg-orange-400';
            case 'success':
                return 'bg-green-600';
            case 'info':
            default:
                return 'bg-blue-600';
        }
    }
}