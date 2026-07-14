import * as React from 'react';
import { IconButton } from '@fluentui/react/lib/Button';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import { getContrastTextColor } from '../../utils/colorUtils';
import { IToolbarProps } from './IToolbarProps';
import styles from './Toolbar.module.scss';

/**
 * Barra de ferramentas superior, puramente controlada (sem estado próprio): todos os
 * valores exibidos e ações vêm do componente `Flipbook`, que é a única fonte de verdade
 * para página atual/zoom/painéis abertos. Isso mantém o `Toolbar` fácil de testar e
 * reutilizar em outros contextos futuros (ex.: modo de impressão).
 */
export const Toolbar: React.FC<IToolbarProps> = (props) => {
  const {
    currentPage,
    numPages,
    showPageCounter,
    showZoom,
    showThumbnails,
    showFullscreen,
    onPrevPage,
    onNextPage,
    canGoPrev,
    canGoNext,
    zoomScale,
    canZoomIn,
    canZoomOut,
    onZoomIn,
    onZoomOut,
    isThumbnailPanelOpen,
    onToggleThumbnails,
    isFullscreen,
    isFullscreenSupported,
    onToggleFullscreen,
    toolbarColor,
    primaryColor
  } = props;

  const textColor = getContrastTextColor(toolbarColor);
  const iconColorStyles = { root: { color: textColor }, rootHovered: { color: primaryColor } };

  return (
    <div className={styles.toolbar} style={{ backgroundColor: toolbarColor, color: textColor }} role="toolbar" aria-label="Controles do leitor de e-book">
      <div className={styles.group}>
        <TooltipHost content="Página anterior">
          <IconButton
            iconProps={{ iconName: 'ChevronLeft' }}
            ariaLabel="Página anterior"
            disabled={!canGoPrev}
            onClick={onPrevPage}
            styles={iconColorStyles}
          />
        </TooltipHost>

        {showPageCounter && (
          <span className={styles.pageCounter} aria-live="polite">
            Página {currentPage} de {numPages}
          </span>
        )}

        <TooltipHost content="Próxima página">
          <IconButton
            iconProps={{ iconName: 'ChevronRight' }}
            ariaLabel="Próxima página"
            disabled={!canGoNext}
            onClick={onNextPage}
            styles={iconColorStyles}
          />
        </TooltipHost>
      </div>

      <div className={styles.group}>
        {showZoom && (
          <>
            <TooltipHost content="Diminuir zoom">
              <IconButton
                iconProps={{ iconName: 'ZoomOut' }}
                ariaLabel="Diminuir zoom"
                disabled={!canZoomOut}
                onClick={onZoomOut}
                styles={iconColorStyles}
              />
            </TooltipHost>
            <span className={styles.pageCounter}>{Math.round(zoomScale * 100)}%</span>
            <TooltipHost content="Aumentar zoom">
              <IconButton
                iconProps={{ iconName: 'ZoomIn' }}
                ariaLabel="Aumentar zoom"
                disabled={!canZoomIn}
                onClick={onZoomIn}
                styles={iconColorStyles}
              />
            </TooltipHost>
            <span className={styles.divider} />
          </>
        )}

        {showThumbnails && (
          <TooltipHost content="Miniaturas">
            <IconButton
              iconProps={{ iconName: 'GridViewMedium' }}
              ariaLabel="Mostrar miniaturas"
              checked={isThumbnailPanelOpen}
              onClick={onToggleThumbnails}
              styles={iconColorStyles}
            />
          </TooltipHost>
        )}

        {showFullscreen && isFullscreenSupported && (
          <TooltipHost content={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}>
            <IconButton
              iconProps={{ iconName: isFullscreen ? 'BackToWindow' : 'FullScreen' }}
              ariaLabel={isFullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
              onClick={onToggleFullscreen}
              styles={iconColorStyles}
            />
          </TooltipHost>
        )}
      </div>
    </div>
  );
};
