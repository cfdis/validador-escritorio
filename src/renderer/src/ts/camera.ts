import $ from 'jquery';
import { AppContext } from '../services/AppContext';

let selectedDeviceId: string | null = null;

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

        $('#videoElement').removeClass('hidden');
        $('#stopCameraBtn').removeClass('hidden');

        await qr.startCamera(videoElement, onsuccess, onerror, onException, selectedDeviceId);
    });

    $('#stopCameraBtn').on('click', function (e) {
        e.preventDefault();
        qr.stopCamera(videoElement);
        $('#videoElement').addClass('hidden');
        $('#stopCameraBtn').addClass('hidden');
    });
}

function onsuccess(result: string) {
    console.log('QR Code result:', result);
    $('#qrResult').removeClass('hidden').text(result);
}

function onerror(error: any) {
    console.error('QR Code error:', error);
}

function onException(e: any) {
    console.error('QR Code exception:', e);
    alert('Error al iniciar la cámara: ' + e.message);
}