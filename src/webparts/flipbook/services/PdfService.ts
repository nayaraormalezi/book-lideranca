import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { FlipbookError, FlipbookErrorType } from '../models/FlipbookError';
import { IPdfDocumentInfo, IRenderedPage, IRenderPageOptions } from '../models/PdfModels';
import { PDF_WORKER_CDN_URL } from '../utils/constants';

let isWorkerConfigured = false;

/**
 * Encapsula toda a interação com o PDF.js: carregamento do documento, extração de
 * metadados e renderização (lazy, página a página) para imagens que alimentam o
 * `Flipbook`/`ThumbnailPanel`. Nenhum componente React importa `pdfjs-dist` diretamente.
 */
export class PdfService {
  /**
   * Configura a worker do PDF.js uma única vez por sessão de página. Usamos um worker
   * hospedado em CDN (versão fixada, igual à do `pdfjs-dist` instalado) em vez de tentar
   * empacotar o worker pelo Webpack 4 do SPFx, que não suporta `worker-loader` moderno
   * nem `new Worker(new URL(...))` de forma confiável nessa versão do toolchain.
   */
  public static ensureWorkerConfigured(): void {
    if (isWorkerConfigured) {
      return;
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_CDN_URL;
    isWorkerConfigured = true;
  }

  public async loadDocument(data: ArrayBuffer, fileName: string): Promise<PDFDocumentProxy> {
    PdfService.ensureWorkerConfigured();

    try {
      const loadingTask = pdfjsLib.getDocument({ data });
      return await loadingTask.promise;
    } catch (error) {
      throw new FlipbookError(
        FlipbookErrorType.InvalidPdfFile,
        `O arquivo "${fileName}" não é um PDF válido ou está corrompido.`,
        error as Error
      );
    }
  }

  public async getDocumentInfo(doc: PDFDocumentProxy, fileName: string): Promise<IPdfDocumentInfo> {
    const firstPage = await doc.getPage(1);
    const viewport = firstPage.getViewport({ scale: 1 });

    return {
      numPages: doc.numPages,
      firstPageSize: { width: viewport.width, height: viewport.height },
      fileName
    };
  }

  /**
   * Renderiza uma página específica em um canvas offscreen e devolve o resultado como
   * data URL. O canvas nunca é anexado ao DOM: apenas a imagem final (mais leve para
   * manter em memória/cache) é retida pelo chamador.
   */
  public async renderPage(
    doc: PDFDocumentProxy,
    options: IRenderPageOptions,
    imageFormat: 'image/jpeg' | 'image/png' = 'image/jpeg',
    quality = 0.92
  ): Promise<IRenderedPage> {
    const { pageNumber, targetWidth, devicePixelRatio = 1 } = options;

    try {
      const page = await doc.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = (targetWidth * devicePixelRatio) / baseViewport.width;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Não foi possível obter o contexto 2D do canvas.');
      }

      const renderTask = page.render({ canvasContext: context, viewport });
      await renderTask.promise;

      const dataUrl = canvas.toDataURL(imageFormat, quality);

      // Libera a memória do canvas imediatamente; só o dataUrl precisa ser mantido em cache.
      canvas.width = 0;
      canvas.height = 0;

      return {
        pageNumber,
        status: 'rendered',
        dataUrl,
        size: { width: baseViewport.width, height: baseViewport.height }
      };
    } catch {
      return {
        pageNumber,
        status: 'error',
        size: { width: 0, height: 0 }
      };
    }
  }

  public destroyDocument(doc: PDFDocumentProxy | undefined): void {
    if (doc) {
      doc.destroy().catch(() => {
        /* Best-effort cleanup; ignorar falhas ao destruir o documento. */
      });
    }
  }
}
