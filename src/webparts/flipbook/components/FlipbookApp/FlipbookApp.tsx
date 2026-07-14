import * as React from 'react';
import { usePdf } from '../../hooks/usePdf';
import { useZoom } from '../../hooks/useZoom';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useResponsive } from '../../hooks/useResponsive';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { Loading } from '../Loading';
import { ErrorView } from '../Error';
import { Toolbar } from '../Toolbar';
import { ThumbnailPanel } from '../ThumbnailPanel';
import { Flipbook } from '../Flipbook';
import { IFlipbookHandle } from '../Flipbook/IFlipbookProps';
import { IFlipbookAppProps } from './IFlipbookAppProps';
import styles from './FlipbookApp.module.scss';

/**
 * Componente orquestrador: é o único ponto que conhece simultaneamente os hooks de
 * dados (`usePdf`) e de interação (`useZoom`, `useFullscreen`, `useResponsive`,
 * `useKeyboardNavigation`), e é quem decide qual componente de apresentação exibir
 * conforme o estado (`Loading` / `ErrorView` / `Toolbar`+`Flipbook`+`ThumbnailPanel`).
 * Manter essa orquestração fora do `FlipbookWebPart.ts` permite testar toda a árvore
 * React isoladamente do runtime do SPFx.
 */
export const FlipbookApp: React.FC<IFlipbookAppProps> = (props) => {
  const {
    context,
    pdfUrl,
    primaryColor,
    toolbarColor,
    backgroundColor,
    showThumbnails,
    showZoom,
    showFullscreen,
    showPageCounter,
    openOnCover,
    doublePageMode
  } = props;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const flipbookRef = React.useRef<IFlipbookHandle>(null);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [isThumbnailPanelOpen, setThumbnailPanelOpen] = React.useState(false);

  const { status, error, documentInfo, pages, thumbnails, requestPage, requestThumbnail, retry } = usePdf(
    context,
    pdfUrl
  );
  const zoom = useZoom();
  const { isFullscreen, isSupported: isFullscreenSupported, toggleFullscreen } = useFullscreen(rootRef);
  const { device, containerWidth, containerHeight } = useResponsive(rootRef);

  const numPages = documentInfo?.numPages ?? 0;
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < numPages;

  const handlePrevPage = React.useCallback(() => flipbookRef.current?.flipPrev(), []);
  const handleNextPage = React.useCallback(() => flipbookRef.current?.flipNext(), []);
  const handleFirstPage = React.useCallback(() => flipbookRef.current?.flipToFirst(), []);
  const handleLastPage = React.useCallback(() => flipbookRef.current?.flipToLast(), []);
  const handleSelectPage = React.useCallback((pageNumber: number) => {
    flipbookRef.current?.flipToPage(pageNumber);
    setThumbnailPanelOpen(false);
  }, []);

  const onKeyDown = useKeyboardNavigation({
    onPrevPage: handlePrevPage,
    onNextPage: handleNextPage,
    onFirstPage: handleFirstPage,
    onLastPage: handleLastPage,
    onZoomIn: showZoom ? zoom.zoomIn : undefined,
    onZoomOut: showZoom ? zoom.zoomOut : undefined,
    onToggleFullscreen: showFullscreen ? toggleFullscreen : undefined
  });

  const rootClassName = isFullscreen ? `${styles.root} ${styles.rootFullscreen}` : styles.root;

  return (
    <div
      ref={rootRef}
      className={rootClassName}
      style={{ backgroundColor }}
      tabIndex={0}
      onKeyDown={onKeyDown}
      role="region"
      aria-label="Leitor de e-book em PDF"
    >
      {status === 'error' && error && <ErrorView error={error} onRetry={retry} />}

      {(status === 'idle' || status === 'loading') && <Loading accentColor={primaryColor} />}

      {status === 'success' && documentInfo && (
        <>
          <Toolbar
            currentPage={currentPage}
            numPages={numPages}
            showPageCounter={showPageCounter}
            showZoom={showZoom}
            showThumbnails={showThumbnails}
            showFullscreen={showFullscreen}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            zoomScale={zoom.scale}
            canZoomIn={zoom.scale < zoom.maxScale}
            canZoomOut={zoom.scale > zoom.minScale}
            onZoomIn={zoom.zoomIn}
            onZoomOut={zoom.zoomOut}
            isThumbnailPanelOpen={isThumbnailPanelOpen}
            onToggleThumbnails={() => setThumbnailPanelOpen((open) => !open)}
            isFullscreen={isFullscreen}
            isFullscreenSupported={isFullscreenSupported}
            onToggleFullscreen={toggleFullscreen}
            toolbarColor={toolbarColor}
            primaryColor={primaryColor}
          />

          <div className={styles.stageWrapper}>
            <Flipbook
              ref={flipbookRef}
              documentInfo={documentInfo}
              pages={pages}
              onRequestPage={requestPage}
              onPageChange={setCurrentPage}
              theme={{ primaryColor, toolbarColor, backgroundColor }}
              features={{
                showThumbnails,
                showZoom,
                showFullscreen,
                showPageCounter,
                openOnCover,
                doublePageMode
              }}
              device={device}
              containerWidth={containerWidth}
              containerHeight={containerHeight}
              zoomScale={zoom.scale}
            />
          </div>

          {showThumbnails && (
            <ThumbnailPanel
              isOpen={isThumbnailPanelOpen}
              onDismiss={() => setThumbnailPanelOpen(false)}
              numPages={numPages}
              currentPage={currentPage}
              thumbnails={thumbnails}
              onRequestThumbnail={requestThumbnail}
              onSelectPage={handleSelectPage}
              primaryColor={primaryColor}
            />
          )}
        </>
      )}
    </div>
  );
};
