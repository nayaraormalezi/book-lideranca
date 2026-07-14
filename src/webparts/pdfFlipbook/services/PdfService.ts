import { getDocument, GlobalWorkerOptions, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/legacy/build/pdf';
import workerSrc from 'pdfjs-dist/legacy/build/pdf.worker.min.js';
import { IPdfDocument, IPdfPage } from '../models/IFlipbookProps';

// Webpack emits this dependency as a same-origin client-side asset.
GlobalWorkerOptions.workerSrc = workerSrc;

export class PdfService {
  public async open(data: ArrayBuffer): Promise<IPdfDocument> {
    const document: PDFDocumentProxy = await getDocument({ data }).promise;
    const pages: IPdfPage[] = [];

    for (let pageNumber: number = 1; pageNumber <= document.numPages; pageNumber++) {
      const page: PDFPageProxy = await document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });

      pages.push({
        pageNumber,
        width: viewport.width,
        height: viewport.height,
        render: (targetWidth: number, scale: number = 1) =>
          this.renderPage(page, targetWidth, scale)
      });
    }

    return { numPages: document.numPages, pages };
  }

  private async renderPage(page: PDFPageProxy, targetWidth: number, scale: number): Promise<string> {
    const baseViewport = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: (targetWidth / baseViewport.width) * scale });
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Seu navegador não suporta a renderização necessária para o leitor.');
    }

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    await page.render({ canvasContext: context, viewport }).promise;
    return canvas.toDataURL('image/jpeg', 0.92);
  }
}
