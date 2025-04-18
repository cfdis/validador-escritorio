import $ from 'jquery';
import { AppContext } from '../services/AppContext';
import { renderQrTable, showToast } from '../utils/qrScanShared';

let selectedDeviceId: string | null = null;
const qrResults: Record<string, string>[] = [];

export function init() {
    const qr = AppContext.getInstance().qr();
    const videoElement = $('#videoElement')[0] as HTMLVideoElement;
    const cameraSelect = $('#cameraSelect');

    navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        videoDevices.forEach(device => {
            cameraSelect.append(
                $('<option>').val(device.deviceId).text(device.label || `Cámara ${cameraSelect.children().length}`)
            );
        });
    });

    $('#startCameraBtn').on('click', async (e) => {
        e.preventDefault();

        selectedDeviceId = cameraSelect.val() as string;

        if (!selectedDeviceId) {
            alert('Selecciona una cámara primero.');
            return;
        }

        $('#stopCameraBtn').removeClass('hidden');
        $('#startCameraBtn').addClass('hidden');

        await qr.startCamera(videoElement, onsuccess, onerror, onException, selectedDeviceId);
    });

    $('#stopCameraBtn').on('click', function (e) {
        e.preventDefault();
        qr.stopCamera(videoElement);
        $('#startCameraBtn').removeClass('hidden');
        $('#stopCameraBtn').addClass('hidden');
    });

    $(document).on('click', '.btn-home', function (e) {
        e.preventDefault();
        qr.stopCamera(videoElement);
    });

    $(document).on('click', '.btn-remove', function () {
        const index = parseInt($(this).data('index'), 10);
        if (!isNaN(index)) {
            qrResults.splice(index, 1);
            renderQrTable('cameraQrResultContainer', qrResults);
        }
    });

    $('#validateQrBtn').on('click', function () {
        console.log('Validando los siguientes QR:', qrResults);
        alert(`Aún no implementado, pero tenemos ${qrResults.length} CFDI(s) listos para validar.`);
    });
}

function onsuccess(result: Record<string, string> | null) {
    console.log('QR Code result:', result);
    if (!result) {
        alert('No se detectó un código QR válido. Intenta de nuevo.');
        return;
    }

    const alreadyExists = qrResults.some(r => r.id === result.id);

    if (!alreadyExists) {
        qrResults.push(result);
        renderQrTable('cameraQrResultContainer', qrResults);
    } else {
        showToast('Este CFDI ya fue escaneado.');
    }
}

function onerror(error: any) {
    console.error('QR Code error:', error);
}

function onException(e: any) {
    console.error('QR Code exception:', e);
    alert('Error al iniciar la cámara: ' + e.message);
}