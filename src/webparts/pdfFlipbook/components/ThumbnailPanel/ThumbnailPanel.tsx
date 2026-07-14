import * as React from 'react';
import { IPdfPage } from '../../models/IFlipbookProps';
import styles from '../../PdfFlipbook.module.scss';

export interface IThumbnailPanelProps {
  pages: IPdfPage[];
  pageImages: Record<number, string>;
  currentPage: number;
  onSelect: (pageNumber: number) => void;
}

export const ThumbnailPanel: React.FC<IThumbnailPanelProps> = ({ pages, pageImages, currentPage, onSelect }) => (
  <aside className={styles.thumbnailPanel} aria-label="Miniaturas das páginas">
    {pages.map((page) => (
      <button
        className={`${styles.thumbnail} ${page.pageNumber === currentPage ? styles.thumbnailActive : ''}`}
        key={page.pageNumber}
        onClick={() => onSelect(page.pageNumber)}
        aria-label={`Ir para página ${page.pageNumber}`}
        aria-current={page.pageNumber === currentPage ? 'page' : undefined}
      >
        {pageImages[page.pageNumber] ? (
          <img src={pageImages[page.pageNumber]} alt="" />
        ) : (
          <span>{page.pageNumber}</span>
        )}
        <small>{page.pageNumber}</small>
      </button>
    ))}
  </aside>
);
