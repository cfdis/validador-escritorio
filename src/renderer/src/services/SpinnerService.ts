import $ from 'jquery';

export class SpinnerService {
    private spinnerElementId: string;

    constructor(spinnerElementId = 'spinner') {
        this.spinnerElementId = spinnerElementId;
    }

    show() {
        const el = $('#' + this.spinnerElementId);
        el.removeClass('hidden');
        // if (el) el.style.display = 'block';
    }

    hide() {
        const el = $('#' + this.spinnerElementId);
        el.addClass('hidden');
    }
}