import $ from 'jquery';
import { AppContext } from '../services/AppContext';
import { renderQrTable, showToast } from '../utils/qrScanShared';

export function init() {
    const qr = AppContext.getInstance().qr();
    const qrResults: Record<string, string>[] = [];

    $('#imageInput').on('change', async function (e) {
        const input = e.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) return;

        let anyFound = false;

        for (const file of Array.from(input.files)) {
            const result = await qr.scanImage(file);
            if (result) {
                const alreadyExists = qrResults.some(r => r.id === result.id);

                if (!alreadyExists) {
                    qrResults.push(result);
                    renderQrTable('imageQrResultContainer', qrResults);
                } else {
                    showToast('Este CFDI ya fue escaneado.');
                }
                anyFound = true;
            }
        }

        // if (anyFound) {
        //     resultElement.removeClass('hidden').removeClass('text-red-400').addClass('text-green-400');
        // } else {
        //     resultElement
        //         .removeClass('hidden')
        //         .removeClass('text-green-400')
        //         .addClass('text-red-400')
        //         .text('No se detectó ningún código QR en las imágenes seleccionadas.');
        // }

        // Limpiar input para permitir volver a seleccionar los mismos archivos si se desea
        input.value = '';
    });

    $(document).on('click', '.btn-remove', function () {
        const index = parseInt($(this).data('index'), 10);
        if (!isNaN(index)) {
            qrResults.splice(index, 1);
            renderQrTable('imageQrResultContainer', qrResults);
        }
    });

    $('#validateQrBtn').on('click', function () {
        console.log('Validando los siguientes QR:', qrResults);
        alert(`Aún no implementado, pero tenemos ${qrResults.length} CFDI(s) listos para validar.`);
    });
}