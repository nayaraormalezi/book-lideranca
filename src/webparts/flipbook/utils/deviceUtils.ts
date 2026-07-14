import { DeviceKind } from '../models/FlipbookSettings';
import { FLIPBOOK_CONSTANTS } from './constants';

/**
 * Classifica o dispositivo com base na largura de viewport disponível.
 * Usar largura em vez de user-agent sniffing torna a detecção resiliente
 * a modos de exibição (ex.: Web Part num painel estreito de um desktop).
 */
export function getDeviceKind(viewportWidth: number): DeviceKind {
  if (viewportWidth <= FLIPBOOK_CONSTANTS.BREAKPOINT_MOBILE_MAX) {
    return 'mobile';
  }
  if (viewportWidth <= FLIPBOOK_CONSTANTS.BREAKPOINT_TABLET_MAX) {
    return 'tablet';
  }
  return 'desktop';
}

/** Detecta suporte a eventos de toque, usado para habilitar gestos de swipe. */
export function isTouchDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  );
}
