import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SharePointService } from '../services/SharePointService';
import { PdfService } from '../services/PdfService';
import { FlipbookError, FlipbookErrorType } from '../models/FlipbookError';
import { IPdfDocumentInfo, IRenderedPage } from '../models/PdfModels';
import { FLIPBOOK_CONSTANTS } from '../utils/constants';

export type PdfLoadStatus = 'idle' | 'loading' | 'success' | 'error';

export interface IUsePdfResult {
  status: PdfLoadStatus;
  error?: FlipbookError;
  documentInfo?: IPdfDocumentInfo;
  /** Páginas em resolução "de leitura", usadas pelo `Flipbook`. Chave = número da página. */
  pages: Record<number, IRenderedPage>;
  /** Páginas em resolução reduzida, usadas pelo `ThumbnailPanel`. Chave = número da página. */
  thumbnails: Record<number, IRenderedPage>;
  /**
   * Solicita a renderização (lazy) de uma página em resolução de leitura.
   * Idempotente: chamadas repetidas para uma página já renderizada/renderizando são ignoradas.
   */
  requestPage: (pageNumber: number, targetWidth: number) => void;
  /** Solicita a renderização (lazy) de uma miniatura de página. */
  requestThumbnail: (pageNumber: number) => void;
  /** Reexecuta o carregamento completo do documento (usado pelo botão "Tentar novamente"). */
  retry: () => void;
}

interface IPageCacheController {
  pages: Record<number, IRenderedPage>;
  request: (pageNumber: number, targetWidth: number) => void;
  reset: () => void;
}

/**
 * Fábrica de um pequeno "cache reativo" de páginas renderizadas. Usada duas vezes dentro
 * de `usePdf` (uma para páginas em resolução de leitura, outra para miniaturas), cada uma
 * com sua própria largura alvo — evitando que a mesma página em duas resoluções diferentes
 * sobrescreva uma a outra em um único mapa compartilhado.
 */
function usePageCache(
  documentRef: MutableRefObject<PDFDocumentProxy | undefined>,
  pdfService: PdfService
): IPageCacheController {
  const [pages, setPages] = useState<Record<number, IRenderedPage>>({});
  const pagesRef = useRef<Record<number, IRenderedPage>>({});
  const pendingRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  const request = useCallback(
    (pageNumber: number, targetWidth: number) => {
      const doc = documentRef.current;
      if (!doc || pageNumber < 1) {
        return;
      }

      const existing = pagesRef.current[pageNumber];
      if (existing && (existing.status === 'rendered' || existing.status === 'rendering')) {
        return;
      }
      if (pendingRef.current.has(pageNumber)) {
        return;
      }

      pendingRef.current.add(pageNumber);
      setPages((prev) => ({
        ...prev,
        [pageNumber]: { pageNumber, status: 'rendering', size: prev[pageNumber]?.size ?? { width: 0, height: 0 } }
      }));

      pdfService
        .renderPage(doc, { pageNumber, targetWidth, devicePixelRatio: window.devicePixelRatio || 1 })
        .then((rendered) => {
          pendingRef.current.delete(pageNumber);
          setPages((prev) => ({ ...prev, [pageNumber]: rendered }));
        })
        .catch(() => {
          pendingRef.current.delete(pageNumber);
        });
    },
    [documentRef, pdfService]
  );

  const reset = useCallback(() => {
    setPages({});
    pagesRef.current = {};
    pendingRef.current.clear();
  }, []);

  return { pages, request, reset };
}

/**
 * Hook responsável por orquestrar o ciclo de vida completo de um PDF:
 * download (via `SharePointService`) -> parsing (via `PdfService`) -> renderização
 * lazy de páginas individuais. Mantém toda a lógica assíncrona e de cache fora dos
 * componentes de apresentação, que só leem `status`/`pages`/`thumbnails` e chamam
 * `requestPage`/`requestThumbnail`.
 */
export function usePdf(context: WebPartContext, pdfUrl: string): IUsePdfResult {
  const [status, setStatus] = useState<PdfLoadStatus>('idle');
  const [error, setError] = useState<FlipbookError | undefined>(undefined);
  const [documentInfo, setDocumentInfo] = useState<IPdfDocumentInfo | undefined>(undefined);
  const [retryToken, setRetryToken] = useState(0);

  const sharePointService = useMemo(() => new SharePointService(context), [context]);
  const pdfService = useMemo(() => new PdfService(), []);

  const documentRef = useRef<PDFDocumentProxy | undefined>(undefined);

  const pageCache = usePageCache(documentRef, pdfService);
  const thumbnailCache = usePageCache(documentRef, pdfService);

  useEffect(() => {
    let cancelled = false;

    setStatus('loading');
    setError(undefined);
    setDocumentInfo(undefined);
    pageCache.reset();
    thumbnailCache.reset();

    async function load(): Promise<void> {
      try {
        const file = await sharePointService.getPdfFile(pdfUrl);
        const doc = await pdfService.loadDocument(file.arrayBuffer, file.fileName);

        if (cancelled) {
          pdfService.destroyDocument(doc);
          return;
        }

        documentRef.current = doc;
        const info = await pdfService.getDocumentInfo(doc, file.fileName);

        if (cancelled) {
          return;
        }

        setDocumentInfo(info);
        setStatus('success');
      } catch (caught) {
        if (cancelled) {
          return;
        }
        const flipbookError =
          caught instanceof FlipbookError
            ? caught
            : new FlipbookError(FlipbookErrorType.Unknown, 'Falha inesperada ao carregar o PDF.', caught as Error);
        setError(flipbookError);
        setStatus('error');
      }
    }

    load().catch(() => {
      /* Erros já são tratados dentro de `load`; catch aqui apenas satisfaz o linter de promises. */
    });

    return () => {
      cancelled = true;
      pdfService.destroyDocument(documentRef.current);
      documentRef.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl, sharePointService, pdfService, retryToken]);

  const requestThumbnail = useCallback(
    (pageNumber: number) => thumbnailCache.request(pageNumber, FLIPBOOK_CONSTANTS.THUMBNAIL_TARGET_WIDTH),
    [thumbnailCache]
  );

  const retry = useCallback(() => {
    setRetryToken((token) => token + 1);
  }, []);

  return {
    status,
    error,
    documentInfo,
    pages: pageCache.pages,
    thumbnails: thumbnailCache.pages,
    requestPage: pageCache.request,
    requestThumbnail,
    retry
  };
}
