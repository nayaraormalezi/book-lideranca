import { useCallback, useState } from 'react';
import { IZoomState } from '../models/FlipbookSettings';
import { FLIPBOOK_CONSTANTS } from '../utils/constants';

export interface IUseZoomResult extends IZoomState {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  isZoomed: boolean;
}

/**
 * Estado de zoom independente do motor de flip (StPageFlip não tem noção de zoom).
 * A escala é aplicada via CSS transform pelo componente `Flipbook`, que também decide
 * quando desabilitar o gesto de "virar página" para não conflitar com o pan durante o zoom.
 */
export function useZoom(): IUseZoomResult {
  const [scale, setScale] = useState<number>(FLIPBOOK_CONSTANTS.ZOOM_MIN_SCALE);

  const zoomIn = useCallback(() => {
    setScale((current) => Math.min(FLIPBOOK_CONSTANTS.ZOOM_MAX_SCALE, current + FLIPBOOK_CONSTANTS.ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((current) => Math.max(FLIPBOOK_CONSTANTS.ZOOM_MIN_SCALE, current - FLIPBOOK_CONSTANTS.ZOOM_STEP));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(FLIPBOOK_CONSTANTS.ZOOM_MIN_SCALE);
  }, []);

  return {
    scale,
    minScale: FLIPBOOK_CONSTANTS.ZOOM_MIN_SCALE,
    maxScale: FLIPBOOK_CONSTANTS.ZOOM_MAX_SCALE,
    zoomIn,
    zoomOut,
    resetZoom,
    isZoomed: scale > FLIPBOOK_CONSTANTS.ZOOM_MIN_SCALE
  };
}
