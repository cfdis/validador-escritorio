import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';

export class PdfService {
    constructor() {
        // const pdfWorkerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
        // GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
        const pdfWorkerSrc = './assets/pdf.worker.min.mjs';
        GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
    }

    private async openPdf(file: File): Promise<PDFDocumentProxy> {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = getDocument(arrayBuffer);
        return await loadingTask.promise;
    }

    public async getAsImages(file: File): Promise<HTMLCanvasElement[]> {
        const pdfDoc = await this.openPdf(file);
        const images: HTMLCanvasElement[] = [];

        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const pdfPage = await pdfDoc.getPage(i);
            const viewPort = pdfPage.getViewport({ scale: 2 });

            const canvas = document.createElement('canvas');
            canvas.width = viewPort.width;
            canvas.height = viewPort.height;

            const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
            const renderContext = {
                canvasContext: ctx,
                viewport: viewPort
            };
            await pdfPage.render(renderContext).promise;

            images.push(canvas);
        }

        return images;
    }
}