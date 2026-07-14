import { useCallback, useEffect, useRef, useState } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IPdfDocument } from '../models/IFlipbookProps';
import { PdfService } from '../services/PdfService';
import { SharePointService } from '../services/SharePointService';

export interface IUsePdfResult {
  document?: IPdfDocument;
  pageImages: Record<number, string>;
  isLoading: boolean;
  isRendering: boolean;
  error?: string;
  loadAroundPage: (pageNumber: number, width: number, zoom?: number) => Promise<void>;
}

const RENDER_RADIUS: number = 2;

export function usePdf(context: WebPartContext, pdfUrl: string): IUsePdfResult {
  const [document, setDocument] = useState<IPdfDocument>();
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const documentRef = useRef<IPdfDocument>();
  const renderingPages = useRef<Set<number>>(new Set<number>());

  useEffect(() => {
    let cancelled: boolean = false;
    const load = async (): Promise<void> => {
      if (!pdfUrl.trim()) {
        setDocument(undefined);
        setPageImages({});
        setError('Configure a URL de um PDF na propriedade do Web Part.');
        return;
      }

      setIsLoading(true);
      setError(undefined);
      setPageImages({});
      try {
        const data: ArrayBuffer = await new SharePointService(context).getPdfData(pdfUrl);
        const pdfDocument: IPdfDocument = await new PdfService().open(data);
        if (!cancelled) {
          documentRef.current = pdfDocument;
          setDocument(pdfDocument);
        }
      } catch (exception) {
        if (!cancelled) {
          setError(exception instanceof Error ? exception.message : 'Não foi possível abrir o PDF.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [context, pdfUrl]);

  const loadAroundPage = useCallback(async (pageNumber: number, width: number, zoom: number = 1): Promise<void> => {
    const pdfDocument = documentRef.current;
    if (!pdfDocument || width <= 0) {
      return;
    }

    const pagesToRender: number[] = [];
    for (
      let page = Math.max(1, pageNumber - RENDER_RADIUS);
      page <= Math.min(pdfDocument.numPages, pageNumber + RENDER_RADIUS + 1);
      page++
    ) {
      if (!pageImages[page] && !renderingPages.current.has(page)) {
        pagesToRender.push(page);
      }
    }

    if (!pagesToRender.length) {
      return;
    }

    pagesToRender.forEach((page) => renderingPages.current.add(page));
    setIsRendering(true);
    try {
      const images = await Promise.all(
        pagesToRender.map(async (pageNumberToRender) => ({
          pageNumber: pageNumberToRender,
          image: await pdfDocument.pages[pageNumberToRender - 1].render(width, zoom)
        }))
      );
      setPageImages((current) => images.reduce(
        (all, rendered) => ({ ...all, [rendered.pageNumber]: rendered.image }),
        current
      ));
    } finally {
      pagesToRender.forEach((page) => renderingPages.current.delete(page));
      setIsRendering(renderingPages.current.size > 0);
    }
  }, [pageImages]);

  return { document, pageImages, isLoading, isRendering, error, loadAroundPage };
}
