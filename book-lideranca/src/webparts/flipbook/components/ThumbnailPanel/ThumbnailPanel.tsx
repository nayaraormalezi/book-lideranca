import * as React from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { IPdfService } from '../../models';
import styles from '../Flipbook/Flipbook.module.scss';

export interface IThumbnailPanelProps {
  document: PDFDocumentProxy;
  pdfService: IPdfService;
  currentPage: number;
  primaryColor: string;
  onSelectPage: (pageIndex: number) => void;
}

interface IThumbnailProps {
  pageIndex: number;
  selected: boolean;
  document: PDFDocumentProxy;
  pdfService: IPdfService;
  primaryColor: string;
  onSelectPage: (pageIndex: number) => void;
}

const Thumbnail: React.FC<IThumbnailProps> = props => {
  const itemRef = React.useRef<HTMLButtonElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const element = itemRef.current;
    if (!element || visible) {
      return () => undefined;
    }

    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '160px' });

    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  React.useEffect(() => {
    if (visible && canvasRef.current) {
      void props.pdfService.renderPage(
        props.document,
        props.pageIndex + 1,
        canvasRef.current,
        112,
        1
      );
    }
  }, [visible, props.document, props.pageIndex, props.pdfService]);

  return (
    <button
      ref={itemRef}
      type="button"
      className={`${styles.thumbnail} ${props.selected ? styles.thumbnailSelected : ''}`}
      style={props.selected ? { borderColor: props.primaryColor } : undefined}
      aria-current={props.selected ? 'page' : undefined}
      aria-label={`Ir para a página ${props.pageIndex + 1}`}
      onClick={() => props.onSelectPage(props.pageIndex)}
    >
      <span className={styles.thumbnailCanvas}>
        {visible && <canvas ref={canvasRef} />}
      </span>
      <span>{props.pageIndex + 1}</span>
    </button>
  );
};

export const ThumbnailPanel: React.FC<IThumbnailPanelProps> = props => {
  const selectedRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest' });
  }, [props.currentPage]);

  return (
    <aside className={styles.thumbnailPanel} aria-label="Miniaturas das páginas">
      {Array.from({ length: props.document.numPages }, (_, pageIndex) => (
        <div
          key={pageIndex}
          ref={pageIndex === props.currentPage ? selectedRef : undefined}
        >
          <Thumbnail
            pageIndex={pageIndex}
            selected={pageIndex === props.currentPage}
            document={props.document}
            pdfService={props.pdfService}
            primaryColor={props.primaryColor}
            onSelectPage={props.onSelectPage}
          />
        </div>
      ))}
    </aside>
  );
};
