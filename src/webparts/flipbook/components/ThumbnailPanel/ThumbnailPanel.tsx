import * as React from 'react';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { List } from '@fluentui/react/lib/List';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { IRenderedPage } from '../../models/PdfModels';
import { IThumbnailPanelProps } from './IThumbnailPanelProps';
import styles from './ThumbnailPanel.module.scss';

interface IThumbnailItemProps {
  pageNumber: number;
  isActive: boolean;
  thumbnail?: IRenderedPage;
  onRequestThumbnail: (pageNumber: number) => void;
  onSelectPage: (pageNumber: number) => void;
}

/**
 * Cada miniatura só solicita sua própria renderização ao ser montada — e o `List` do
 * Fluent UI só monta as células atualmente visíveis (virtualização nativa). O resultado
 * é que apenas as miniaturas realmente visíveis no painel são rasterizadas pelo PDF.js,
 * mesmo em PDFs com centenas de páginas.
 */
const ThumbnailItem: React.FC<IThumbnailItemProps> = ({
  pageNumber,
  isActive,
  thumbnail,
  onRequestThumbnail,
  onSelectPage
}) => {
  React.useEffect(() => {
    onRequestThumbnail(pageNumber);
  }, [pageNumber, onRequestThumbnail]);

  return (
    <button
      type="button"
      className={styles.item}
      onClick={() => onSelectPage(pageNumber)}
      aria-current={isActive}
      aria-label={`Ir para a página ${pageNumber}`}
    >
      <span className={`${styles.thumbFrame} ${isActive ? styles.thumbFrameActive : ''}`}>
        {thumbnail?.status === 'rendered' && thumbnail.dataUrl ? (
          <img className={styles.thumbImage} src={thumbnail.dataUrl} alt={`Miniatura da página ${pageNumber}`} />
        ) : (
          <Spinner size={SpinnerSize.small} />
        )}
      </span>
      <span className={`${styles.pageLabel} ${isActive ? styles.pageLabelActive : ''}`}>{pageNumber}</span>
    </button>
  );
};

export const ThumbnailPanel: React.FC<IThumbnailPanelProps> = ({
  isOpen,
  onDismiss,
  numPages,
  currentPage,
  thumbnails,
  onRequestThumbnail,
  onSelectPage,
  primaryColor
}) => {
  const pageNumbers = React.useMemo(() => Array.from({ length: numPages }, (_, index) => index + 1), [numPages]);

  const onRenderCell = React.useCallback(
    (pageNumber?: number): JSX.Element | null => {
      if (!pageNumber) {
        return null;
      }
      return (
        <ThumbnailItem
          pageNumber={pageNumber}
          isActive={pageNumber === currentPage}
          thumbnail={thumbnails[pageNumber]}
          onRequestThumbnail={onRequestThumbnail}
          onSelectPage={onSelectPage}
        />
      );
    },
    [currentPage, thumbnails, onRequestThumbnail, onSelectPage]
  );

  const accentVariable = { '--flipbookAccent': primaryColor } as React.CSSProperties;

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.smallFixedFar}
      headerText="Miniaturas"
      closeButtonAriaLabel="Fechar"
      isLightDismiss
    >
      <div className={styles.grid} style={accentVariable}>
        <List items={pageNumbers} onRenderCell={onRenderCell} />
      </div>
    </Panel>
  );
};
