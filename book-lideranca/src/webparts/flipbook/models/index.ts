import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface IFlipbookSettings {
  pdfUrl: string;
  primaryColor: string;
  toolbarColor: string;
  backgroundColor: string;
  showThumbnails: boolean;
  showZoom: boolean;
  showFullscreen: boolean;
  showPageCounter: boolean;
  openAtCover: boolean;
  openInDoublePage: boolean;
}

export interface IFlipbookProps extends IFlipbookSettings {
  sharePointService: ISharePointService;
  pdfService: IPdfService;
}

export interface ISharePointService {
  getPdf(pdfUrl: string): Promise<ArrayBuffer>;
}

export interface IPdfService {
  load(data: ArrayBuffer, onProgress?: (progress: number) => void): Promise<PDFDocumentProxy>;
  getPageRatio(document: PDFDocumentProxy): Promise<number>;
  renderPage(
    document: PDFDocumentProxy,
    pageNumber: number,
    canvas: HTMLCanvasElement,
    targetWidth: number,
    qualityScale?: number
  ): Promise<void>;
}

export type PdfErrorCode =
  | 'invalid-url'
  | 'not-found'
  | 'access-denied'
  | 'library-unavailable'
  | 'invalid-pdf'
  | 'unknown';

export class PdfReaderError extends Error {
  public constructor(
    public readonly code: PdfErrorCode,
    message: string,
    public readonly status?: number,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'PdfReaderError';
  }
}

export interface IPdfLoadState {
  document?: PDFDocumentProxy;
  loading: boolean;
  progress: number;
  error?: PdfReaderError;
}
