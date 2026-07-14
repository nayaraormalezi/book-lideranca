import * as React from 'react';
import { IconButton, Slider, TooltipHost } from '@fluentui/react';
import styles from '../Flipbook/Flipbook.module.scss';

export interface IToolbarProps {
  currentPage: number;
  pageCount: number;
  zoom: number;
  toolbarColor: string;
  primaryColor: string;
  showZoom: boolean;
  showFullscreen: boolean;
  showPageCounter: boolean;
  showThumbnailToggle: boolean;
  thumbnailsExpanded: boolean;
  isFullscreen: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onZoomChange: (value: number) => void;
  onToggleFullscreen: () => void;
  onToggleThumbnails: () => void;
}

const ToolbarButton: React.FC<{
  iconName: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}> = ({ iconName, label, disabled, onClick }) => (
  <TooltipHost content={label}>
    <IconButton
      iconProps={{ iconName }}
      ariaLabel={label}
      disabled={disabled}
      onClick={onClick}
      className={styles.toolbarButton}
    />
  </TooltipHost>
);

export const Toolbar: React.FC<IToolbarProps> = props => (
  <div
    className={styles.toolbar}
    style={{ backgroundColor: props.toolbarColor, '--flipbook-accent': props.primaryColor } as React.CSSProperties}
    role="toolbar"
    aria-label="Controles do leitor"
  >
    {props.showThumbnailToggle && (
      <ToolbarButton
        iconName="BulletedList"
        label={props.thumbnailsExpanded ? 'Ocultar miniaturas' : 'Mostrar miniaturas'}
        onClick={props.onToggleThumbnails}
      />
    )}
    <ToolbarButton
      iconName="ChevronLeft"
      label="Página anterior"
      disabled={props.currentPage <= 0}
      onClick={props.onPrevious}
    />
    <ToolbarButton
      iconName="ChevronRight"
      label="Próxima página"
      disabled={props.currentPage >= props.pageCount - 1}
      onClick={props.onNext}
    />

    {props.showPageCounter && (
      <span className={styles.pageCounter} aria-live="polite">
        Página {Math.min(props.currentPage + 1, props.pageCount)} de {props.pageCount}
      </span>
    )}

    <span className={styles.toolbarSpacer} />

    {props.showZoom && (
      <div className={styles.zoomControl}>
        <span aria-hidden="true">−</span>
        <Slider
          min={0.75}
          max={2}
          step={0.25}
          value={props.zoom}
          showValue={false}
          ariaLabel="Nível de zoom"
          onChange={props.onZoomChange}
        />
        <span className={styles.zoomValue}>{Math.round(props.zoom * 100)}%</span>
      </div>
    )}

    {props.showFullscreen && (
      <ToolbarButton
        iconName={props.isFullscreen ? 'BackToWindow' : 'FullScreen'}
        label={props.isFullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
        onClick={props.onToggleFullscreen}
      />
    )}
  </div>
);
