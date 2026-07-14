import * as React from 'react';
import { IconButton, TooltipHost } from '@fluentui/react';
import styles from '../../PdfFlipbook.module.scss';

export interface IToolbarProps {
  currentPage: number;
  pageCount: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  showZoom: boolean;
  showFullscreen: boolean;
  showPageCounter: boolean;
  backgroundColor: string;
  onPrevious: () => void;
  onNext: () => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onFullscreen: () => void;
}

const Button: React.FC<{ label: string; icon: string; disabled?: boolean; onClick: () => void }> =
  ({ label, icon, disabled, onClick }) => (
    <TooltipHost content={label}>
      <IconButton ariaLabel={label} iconProps={{ iconName: icon }} disabled={disabled} onClick={onClick} />
    </TooltipHost>
  );

export const Toolbar: React.FC<IToolbarProps> = (props) => (
  <nav className={styles.toolbar} style={{ backgroundColor: props.backgroundColor }} aria-label="Controles do leitor">
    <Button label="Página anterior" icon="ChevronLeft" disabled={!props.canGoPrevious} onClick={props.onPrevious} />
    <Button label="Próxima página" icon="ChevronRight" disabled={!props.canGoNext} onClick={props.onNext} />
    {props.showPageCounter && (
      <span className={styles.pageCounter} aria-live="polite">
        Página {props.currentPage} de {props.pageCount}
      </span>
    )}
    <span className={styles.toolbarSpacer} />
    {props.showZoom && <>
      <Button label="Reduzir zoom" icon="ZoomOut" onClick={props.onZoomOut} />
      <Button label="Aumentar zoom" icon="ZoomIn" onClick={props.onZoomIn} />
    </>}
    {props.showFullscreen && <Button label="Tela cheia" icon="FullScreen" onClick={props.onFullscreen} />}
  </nav>
);
