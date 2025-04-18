import $ from 'jquery';
import { AppContext } from '../services/AppContext';

export function init() {
    const qr = AppContext.getInstance().qr();

    $('#imageInput').on('change', async function (e) {
        const input = e.target as HTMLInputElement;
        const resultElement = $('#qrResult');
        resultElement.addClass('hidden').text('');

        if (!input.files || input.files.length === 0) return;

        let anyFound = false;

        for (const file of Array.from(input.files)) {
            const result = await qr.scanImage(file);
            if (result) {
                resultElement.append($('<div>').text(result));
                anyFound = true;
            }
        }

        if (anyFound) {
            resultElement.removeClass('hidden').removeClass('text-red-400').addClass('text-green-400');
        } else {
            resultElement
                .removeClass('hidden')
                .removeClass('text-green-400')
                .addClass('text-red-400')
                .text('No se detectó ningún código QR en las imágenes seleccionadas.');
        }

        // Limpiar input para permitir volver a seleccionar los mismos archivos si se desea
        input.value = '';
    });
}