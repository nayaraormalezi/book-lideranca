import { useEffect, useState } from 'react';
import { IPdfLoadState, IPdfService, ISharePointService, PdfReaderError } from '../models';

const INITIAL_STATE: IPdfLoadState = {
  loading: false,
  progress: 0
};

export function usePdf(
  pdfUrl: string,
  sharePointService: ISharePointService,
  pdfService: IPdfService
): IPdfLoadState {
  const [state, setState] = useState<IPdfLoadState>(INITIAL_STATE);

  useEffect(() => {
    let active = true;
    let loadedDocument: IPdfLoadState['document'];

    if (!pdfUrl.trim()) {
      setState({
        loading: false,
        progress: 0,
        error: new PdfReaderError(
          'invalid-url',
          'Configure a URL de PDF no painel de propriedades.'
        )
      });
      return () => undefined;
    }

    setState({ loading: true, progress: 0 });

    const loadPdf = async (): Promise<void> => {
      try {
        const data = await sharePointService.getPdf(pdfUrl);
        if (!active) {
          return;
        }

        loadedDocument = await pdfService.load(data, progress => {
          if (active) {
            setState(current => ({ ...current, progress }));
          }
        });

        if (active) {
          setState({
            document: loadedDocument,
            loading: false,
            progress: 100
          });
        } else {
          await loadedDocument.destroy();
        }
      } catch (error) {
        if (!active) {
          return;
        }

        const readerError = error instanceof PdfReaderError
          ? error
          : new PdfReaderError(
            'unknown',
            'Ocorreu um erro inesperado ao abrir o PDF.',
            undefined,
            error
          );

        setState({
          loading: false,
          progress: 0,
          error: readerError
        });
      }
    };

    void loadPdf();

    return () => {
      active = false;
      if (loadedDocument) {
        void loadedDocument.destroy();
      }
    };
  }, [pdfUrl, sharePointService, pdfService]);

  return state;
}
