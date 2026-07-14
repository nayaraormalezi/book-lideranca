import { KeyboardEvent, useCallback } from 'react';

export interface IKeyboardNavigationCallbacks {
  onPrevPage: () => void;
  onNextPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onToggleFullscreen?: () => void;
}

/**
 * Gera um handler de `onKeyDown` a ser aplicado no contêiner do leitor (com `tabIndex={0}`),
 * em vez de escutar `keydown` no `document`. Isso evita capturar teclas globalmente e
 * interferir em outros Web Parts/campos de texto na mesma página do SharePoint — a
 * navegação por teclado só reage quando o leitor está efetivamente focado/em uso.
 */
export function useKeyboardNavigation(
  callbacks: IKeyboardNavigationCallbacks
): (event: KeyboardEvent<HTMLElement>) => void {
  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'PageDown':
          event.preventDefault();
          callbacks.onNextPage();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          event.preventDefault();
          callbacks.onPrevPage();
          break;
        case 'Home':
          event.preventDefault();
          callbacks.onFirstPage();
          break;
        case 'End':
          event.preventDefault();
          callbacks.onLastPage();
          break;
        case '+':
        case '=':
          if (callbacks.onZoomIn) {
            event.preventDefault();
            callbacks.onZoomIn();
          }
          break;
        case '-':
          if (callbacks.onZoomOut) {
            event.preventDefault();
            callbacks.onZoomOut();
          }
          break;
        case 'f':
        case 'F':
          if (callbacks.onToggleFullscreen) {
            event.preventDefault();
            callbacks.onToggleFullscreen();
          }
          break;
        default:
          break;
      }
    },
    [callbacks]
  );
}
