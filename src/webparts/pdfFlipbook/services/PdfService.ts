import { getDocument, GlobalWorkerOptions, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/legacy/build/pdf';
import { IPdfDocument, IPdfPage } from '../models/IFlipbookProps';

// PDF.js ships the worker in the package. A same-origin worker URL avoids CORS
// and permits the SharePoint workbench to load it under the tenant session.
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

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
