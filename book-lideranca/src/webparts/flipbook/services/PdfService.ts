import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentLoadingTask,
  type PDFDocumentProxy,
  type RenderTask
} from 'pdfjs-dist';
import { IPdfService, PdfReaderError } from '../models';

interface IPdfProgress {
  loaded: number;
  total: number;
}

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export class PdfService implements IPdfService {
  private readonly activeRenders = new WeakMap<HTMLCanvasElement, RenderTask>();

  public async load(
    data: ArrayBuffer,
    onProgress?: (progress: number) => void
  ): Promise<PDFDocumentProxy> {
    let loadingTask: PDFDocumentLoadingTask | undefined;

    try {
      loadingTask = getDocument({
        data: new Uint8Array(data),
        useSystemFonts: true
      });

      loadingTask.onProgress = (progress: IPdfProgress) => {
        if (onProgress && progress.total > 0) {
          onProgress(Math.min(100, Math.round((progress.loaded / progress.total) * 100)));
        }
      };

      return await loadingTask.promise;
    } catch (error) {
      if (loadingTask) {
        await loadingTask.destroy();
      }

      throw new PdfReaderError(
        'invalid-pdf',
        'Não foi possível processar o PDF. O arquivo pode estar corrompido ou protegido.',
        undefined,
        error
      );
    }
  }

  public async getPageRatio(document: PDFDocumentProxy): Promise<number> {
    const page = await document.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    return viewport.width / viewport.height;
  }

  public async renderPage(
    document: PDFDocumentProxy,
    pageNumber: number,
    canvas: HTMLCanvasElement,
    targetWidth: number,
    qualityScale: number = 1
  ): Promise<void> {
    const previousRender = this.activeRenders.get(canvas);
    if (previousRender) {
      previousRender.cancel();
    }

    const page = await document.getPage(pageNumber);
    const unscaledViewport = page.getViewport({ scale: 1 });
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const scale = Math.max(0.1, (targetWidth / unscaledViewport.width) * qualityScale);
    const viewport = page.getViewport({ scale });

    this.resizeCanvas(canvas, viewport.width, viewport.height, pixelRatio);

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new PdfReaderError('unknown', 'O navegador não oferece suporte à renderização do PDF.');
    }

    const renderTask = page.render({
      canvas,
      canvasContext: context,
      viewport,
      transform: pixelRatio === 1 ? undefined : [pixelRatio, 0, 0, pixelRatio, 0, 0]
    });

    this.activeRenders.set(canvas, renderTask);

    try {
      await renderTask.promise;
    } catch (error) {
      if (!(error instanceof Error) || error.name !== 'RenderingCancelledException') {
        throw error;
      }
    } finally {
      if (this.activeRenders.get(canvas) === renderTask) {
        this.activeRenders.delete(canvas);
      }
    }
  }

  private resizeCanvas(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    pixelRatio: number
  ): void {
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${Math.floor(width)}px`;
    canvas.style.height = `${Math.floor(height)}px`;
  }
}
