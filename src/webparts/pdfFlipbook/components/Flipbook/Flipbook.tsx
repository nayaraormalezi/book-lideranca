import * as React from 'react';
import HTMLFlipBook from 'react-pageflip-enhanced';
import { IFlipbookProperties, IPdfDocument } from '../../models/IFlipbookProps';
import styles from '../../PdfFlipbook.module.scss';

export interface IFlipbookProps extends Pick<IFlipbookProperties, 'primaryColor' | 'openOnCover' | 'openInDoublePage'> {
  document: IPdfDocument;
  pageImages: Record<number, string>;
  zoom: number;
  onPageChange: (pageNumber: number) => void;
  onReady: (api: IFlipbookApi) => void;
}

export interface IFlipbookApi {
  previous: () => void;
  next: () => void;
  goTo: (pageNumber: number) => void;
}

export const Flipbook: React.FC<IFlipbookProps> = ({
  document,
  pageImages,
  zoom,
  primaryColor,
  openOnCover,
  openInDoublePage,
  onPageChange,
  onReady
}) => {
  const bookRef = React.useRef<any>(null);

  React.useEffect(() => {
    onReady({
      previous: () => bookRef.current?.pageFlip()?.flipPrev(),
      next: () => bookRef.current?.pageFlip()?.flipNext(),
      goTo: (pageNumber: number) => bookRef.current?.pageFlip()?.turnToPage(Math.max(0, pageNumber - 1))
    });
  }, [onReady]);

  React.useEffect(() => {
    if (!openOnCover) {
      bookRef.current?.pageFlip()?.turnToPage(1);
    }
  }, [openOnCover]);

  return (
    <div className={styles.bookViewport} style={{ '--flipbook-primary': primaryColor } as React.CSSProperties}>
      <div className={styles.bookZoomLayer} style={{ transform: `scale(${zoom})` }}>
        <HTMLFlipBook
          ref={bookRef}
          width={550}
          height={710}
          size="stretch"
          minWidth={280}
          maxWidth={650}
          minHeight={360}
          maxHeight={840}
          maxShadowOpacity={0.45}
          showCover={true}
          mobileScrollSupport={true}
          usePortrait={!openInDoublePage}
          startPage={openOnCover ? 0 : 1}
          flippingTime={700}
          onFlip={(event: { data: number }) => onPageChange(event.data + 1)}
          className={styles.htmlFlipBook}
        >
          {document.pages.map((page) => (
            <div className={styles.flipPage} key={page.pageNumber} data-density={page.pageNumber === 1 ? 'hard' : 'soft'}>
              {pageImages[page.pageNumber] ? (
                <img src={pageImages[page.pageNumber]} alt={`Página ${page.pageNumber}`} draggable={false} />
              ) : (
                <div className={styles.pagePlaceholder} aria-label={`Renderizando página ${page.pageNumber}`}>
                  <span>{page.pageNumber}</span>
                </div>
              )}
            </div>
          ))}
        </HTMLFlipBook>
      </div>
    </div>
  );
};
