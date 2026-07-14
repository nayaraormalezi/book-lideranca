import * as React from 'react';
import { PageFlip, type IPageFlipEvent } from 'page-flip';
import { usePdf } from '../../hooks/usePdf';
import { IFlipbookProps } from '../../models';
import { ErrorState } from '../Error/ErrorState';
import { Loading } from '../Loading/Loading';
import { ThumbnailPanel } from '../ThumbnailPanel/ThumbnailPanel';
import { Toolbar } from '../Toolbar/Toolbar';
import styles from './Flipbook.module.scss';

const BASE_PAGE_WIDTH = 700;
const RENDER_AHEAD_PAGES = 4;

export const Flipbook: React.FC<IFlipbookProps> = props => {
  const readerRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const pageFlipRef = React.useRef<PageFlip>();
  const pageElementsRef = React.useRef<HTMLElement[]>([]);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [zoom, setZoom] = React.useState(1);
  const [initialized, setInitialized] = React.useState(0);
  const [renderVersion, setRenderVersion] = React.useState(0);
  const [thumbnailsExpanded, setThumbnailsExpanded] = React.useState(props.showThumbnails);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const pdf = usePdf(props.pdfUrl, props.sharePointService, props.pdfService);

  React.useEffect(() => {
    setThumbnailsExpanded(props.showThumbnails);
  }, [props.showThumbnails]);

  React.useEffect(() => {
    const onFullscreenChange = (): void => {
      setIsFullscreen(document.fullscreenElement === readerRef.current);
      window.setTimeout(() => pageFlipRef.current?.update(), 50);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !pdf.document) {
      return () => undefined;
    }

    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    const pageElements: HTMLElement[] = [];
    const bookRoot = document.createElement('div');
    bookRoot.className = styles.bookRoot;
    stage.appendChild(bookRoot);

    const initialize = async (): Promise<void> => {
      const ratio = await props.pdfService.getPageRatio(pdf.document!);
      if (cancelled) {
        return;
      }

      const pageHeight = Math.round(BASE_PAGE_WIDTH / ratio);
      for (let pageIndex = 0; pageIndex < pdf.document!.numPages; pageIndex++) {
        const page = document.createElement('div');
        page.className = styles.pdfPage;
        page.dataset.pageIndex = pageIndex.toString();
        if (pageIndex === 0 || pageIndex === pdf.document!.numPages - 1) {
          page.dataset.density = 'hard';
        }

        const loading = document.createElement('span');
        loading.className = styles.pageLoading;
        loading.textContent = `Carregando página ${pageIndex + 1}`;

        const canvas = document.createElement('canvas');
        canvas.className = styles.pageCanvas;
        canvas.setAttribute('aria-label', `Página ${pageIndex + 1}`);

        page.appendChild(loading);
        page.appendChild(canvas);
        pageElements.push(page);
      }

      const startPage = props.openAtCover || pdf.document!.numPages === 1 ? 0 : 1;
      const pageFlip = new PageFlip(bookRoot, {
        width: BASE_PAGE_WIDTH,
        height: pageHeight,
        size: 'stretch',
        minWidth: 280,
        maxWidth: BASE_PAGE_WIDTH,
        minHeight: Math.round(280 / ratio),
        maxHeight: pageHeight,
        startPage,
        showCover: true,
        usePortrait: !props.openInDoublePage,
        autoSize: true,
        drawShadow: true,
        maxShadowOpacity: 0.45,
        flippingTime: 850,
        mobileScrollSupport: true,
        swipeDistance: 24,
        showPageCorners: true
      });

      pageFlip.on('flip', (event: IPageFlipEvent) => {
        setCurrentPage(Number(event.data));
      });
      pageFlip.loadFromHTML(pageElements);

      pageFlipRef.current = pageFlip;
      pageElementsRef.current = pageElements;
      setCurrentPage(startPage);
      setInitialized(value => value + 1);

      resizeObserver = new ResizeObserver(() => {
        pageFlip.update();
        setRenderVersion(value => value + 1);
      });
      resizeObserver.observe(stage);
    };

    void initialize();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      if (pageFlipRef.current) {
        pageFlipRef.current.off('flip');
        pageFlipRef.current.clear();
        pageFlipRef.current.destroy();
        pageFlipRef.current = undefined;
      } else if (bookRoot.parentElement) {
        bookRoot.remove();
      }
      pageElementsRef.current = [];
    };
  }, [pdf.document, props.openAtCover, props.openInDoublePage, props.pdfService]);

  React.useEffect(() => {
    if (!pdf.document || initialized === 0) {
      return;
    }

    const firstPage = Math.max(0, currentPage - RENDER_AHEAD_PAGES);
    const lastPage = Math.min(
      pdf.document.numPages - 1,
      currentPage + RENDER_AHEAD_PAGES + 1
    );

    pageElementsRef.current.forEach((pageElement, pageIndex) => {
      const canvas = pageElement.querySelector('canvas');
      const loading = pageElement.querySelector(`.${styles.pageLoading}`) as HTMLElement | null;
      if (!canvas) {
        return;
      }

      if (pageIndex < firstPage || pageIndex > lastPage) {
        if (canvas.width > 1) {
          canvas.width = 1;
          canvas.height = 1;
          delete canvas.dataset.renderKey;
          if (loading) {
            loading.style.display = '';
          }
        }
        return;
      }

      const targetWidth = Math.max(pageElement.clientWidth, 280);
      const renderKey = `${Math.round(targetWidth)}-${zoom}-${renderVersion}`;
      if (canvas.dataset.renderKey === renderKey) {
        return;
      }

      canvas.dataset.renderKey = renderKey;
      if (loading) {
        loading.style.display = '';
      }

      void props.pdfService
        .renderPage(pdf.document!, pageIndex + 1, canvas, targetWidth, zoom)
        .then(() => {
          if (canvas.dataset.renderKey === renderKey && loading) {
            loading.style.display = 'none';
          }
        })
        .catch(() => {
          delete canvas.dataset.renderKey;
          if (loading) {
            loading.textContent = `Falha ao renderizar a página ${pageIndex + 1}`;
          }
        });
    });
  }, [currentPage, initialized, pdf.document, props.pdfService, renderVersion, zoom]);

  const goToPage = React.useCallback((pageIndex: number): void => {
    pageFlipRef.current?.turnToPage(pageIndex);
    setCurrentPage(pageIndex);
  }, []);

  const toggleFullscreen = React.useCallback((): void => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (readerRef.current?.requestFullscreen) {
      void readerRef.current.requestFullscreen();
    }
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>): void => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON') {
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      pageFlipRef.current?.flipPrev();
    } else if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
      event.preventDefault();
      pageFlipRef.current?.flipNext();
    } else if (event.key === 'Home') {
      event.preventDefault();
      goToPage(0);
    } else if (event.key === 'End' && pdf.document) {
      event.preventDefault();
      goToPage(pdf.document.numPages - 1);
    }
  };

  if (pdf.loading) {
    return <Loading label="Carregando PDF..." progress={pdf.progress} />;
  }

  if (pdf.error) {
    return <ErrorState error={pdf.error} />;
  }

  if (!pdf.document) {
    return <Loading label="Preparando leitor..." />;
  }

  return (
    <section
      ref={readerRef}
      className={styles.reader}
      style={{
        backgroundColor: props.backgroundColor,
        '--flipbook-accent': props.primaryColor
      } as React.CSSProperties}
      tabIndex={0}
      aria-label="Leitor de PDF"
      onKeyDown={handleKeyDown}
    >
      <Toolbar
        currentPage={currentPage}
        pageCount={pdf.document.numPages}
        zoom={zoom}
        toolbarColor={props.toolbarColor}
        primaryColor={props.primaryColor}
        showZoom={props.showZoom}
        showFullscreen={props.showFullscreen}
        showPageCounter={props.showPageCounter}
        showThumbnailToggle={props.showThumbnails}
        thumbnailsExpanded={thumbnailsExpanded}
        isFullscreen={isFullscreen}
        onPrevious={() => pageFlipRef.current?.flipPrev()}
        onNext={() => pageFlipRef.current?.flipNext()}
        onZoomChange={setZoom}
        onToggleFullscreen={toggleFullscreen}
        onToggleThumbnails={() => setThumbnailsExpanded(value => !value)}
      />

      <div className={styles.readerBody}>
        {props.showThumbnails && thumbnailsExpanded && (
          <ThumbnailPanel
            document={pdf.document}
            pdfService={props.pdfService}
            currentPage={currentPage}
            primaryColor={props.primaryColor}
            onSelectPage={goToPage}
          />
        )}
        <div className={styles.bookViewport}>
          <div
            ref={stageRef}
            className={styles.bookStage}
            style={{ transform: `scale(${zoom})` }}
          />
        </div>
      </div>
    </section>
  );
};

export default Flipbook;
