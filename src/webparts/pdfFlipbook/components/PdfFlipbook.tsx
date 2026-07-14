import * as React from 'react';
import { IFlipbookApi, Flipbook } from './Flipbook/Flipbook';
import { Toolbar } from './Toolbar/Toolbar';
import { ThumbnailPanel } from './ThumbnailPanel/ThumbnailPanel';
import { Loading } from './Loading/Loading';
import { ErrorMessage } from './Error/Error';
import { IFlipbookProps } from '../models/IFlipbookProps';
import { usePdf } from '../hooks/usePdf';
import styles from '../PdfFlipbook.module.scss';

const MIN_ZOOM = 0.8;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.1;

export const PdfFlipbook: React.FC<IFlipbookProps> = (props) => {
  const { document: pdfDocument, pageImages, isLoading, isRendering, error, loadAroundPage } = usePdf(props.context, props.pdfUrl);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [zoom, setZoom] = React.useState<number>(1);
  const [bookApi, setBookApi] = React.useState<IFlipbookApi>();
  const [availableWidth, setAvailableWidth] = React.useState<number>(550);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const updateWidth = (): void => setAvailableWidth(Math.max(280, Math.min(650, root.clientWidth / 2)));
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (pdfDocument) {
      void loadAroundPage(currentPage, availableWidth, zoom);
    }
  }, [availableWidth, currentPage, pdfDocument, loadAroundPage, zoom]);

  const onPageChange = React.useCallback((pageNumber: number): void => {
    setCurrentPage(pageNumber);
  }, []);

  const onBookReady = React.useCallback((api: IFlipbookApi): void => {
    setBookApi(api);
  }, []);

  const goToPage = React.useCallback((pageNumber: number): void => {
    bookApi?.goTo(pageNumber);
    setCurrentPage(pageNumber);
  }, [bookApi]);

  const enterFullscreen = async (): Promise<void> => {
    const element = rootRef.current;
    if (!element) {
      return;
    }
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (element.requestFullscreen) {
      await element.requestFullscreen();
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      bookApi?.previous();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      bookApi?.next();
    } else if (event.key === '+' || event.key === '=') {
      setZoom((value) => Math.min(MAX_ZOOM, Number((value + ZOOM_STEP).toFixed(1))));
    } else if (event.key === '-') {
      setZoom((value) => Math.max(MIN_ZOOM, Number((value - ZOOM_STEP).toFixed(1))));
    }
  };

  return (
    <section
      ref={rootRef}
      className={styles.flipbook}
      style={{ backgroundColor: props.backgroundColor, '--flipbook-primary': props.primaryColor } as React.CSSProperties}
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label="Leitor de PDF"
    >
      {isLoading && <Loading label="Carregando PDF..." />}
      {!isLoading && error && <ErrorMessage message={error} />}
      {!isLoading && !error && pdfDocument && <>
        <Toolbar
          currentPage={currentPage}
          pageCount={pdfDocument.numPages}
          canGoPrevious={currentPage > 1}
          canGoNext={currentPage < pdfDocument.numPages}
          showZoom={props.showZoom}
          showFullscreen={props.showFullscreen}
          showPageCounter={props.showPageCounter}
          backgroundColor={props.toolbarColor}
          onPrevious={() => bookApi?.previous()}
          onNext={() => bookApi?.next()}
          onZoomOut={() => setZoom((value) => Math.max(MIN_ZOOM, Number((value - ZOOM_STEP).toFixed(1))))}
          onZoomIn={() => setZoom((value) => Math.min(MAX_ZOOM, Number((value + ZOOM_STEP).toFixed(1))))}
          onFullscreen={() => void enterFullscreen()}
        />
        <div className={styles.content}>
          {props.showThumbnails && (
            <ThumbnailPanel
              pages={pdfDocument.pages}
              pageImages={pageImages}
              currentPage={currentPage}
              onSelect={goToPage}
            />
          )}
          <div className={styles.readerArea}>
            {isRendering && <div className={styles.rendering}>Renderizando páginas…</div>}
            <Flipbook
              document={pdfDocument}
              pageImages={pageImages}
              zoom={zoom}
              primaryColor={props.primaryColor}
              openOnCover={props.openOnCover}
              openInDoublePage={props.openInDoublePage}
              onPageChange={onPageChange}
              onReady={onBookReady}
            />
          </div>
        </div>
      </>}
    </section>
  );
};
