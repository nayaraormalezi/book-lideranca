import { RefObject, useCallback, useEffect, useState } from 'react';
import {
  exitFullscreen,
  getFullscreenElement,
  isFullscreenSupported,
  requestFullscreen
} from '../utils/fullscreenUtils';

export interface IUseFullscreenResult {
  isFullscreen: boolean;
  isSupported: boolean;
  toggleFullscreen: () => void;
}

/**
 * Controla o estado de tela cheia de um contêiner específico (não da página inteira),
 * permitindo que o leitor ocupe toda a tela mesmo quando embutido em uma página do SharePoint.
 */
export function useFullscreen(containerRef: RefObject<HTMLElement>): IUseFullscreenResult {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isSupported = isFullscreenSupported();

  useEffect(() => {
    const handleChange = (): void => {
      setIsFullscreen(getFullscreenElement() === containerRef.current);
    };

    document.addEventListener('fullscreenchange', handleChange);
    document.addEventListener('webkitfullscreenchange', handleChange);
    document.addEventListener('MSFullscreenChange', handleChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      document.removeEventListener('webkitfullscreenchange', handleChange);
      document.removeEventListener('MSFullscreenChange', handleChange);
    };
  }, [containerRef]);

  const toggleFullscreen = useCallback(() => {
    if (!isSupported || !containerRef.current) {
      return;
    }

    if (getFullscreenElement()) {
      exitFullscreen().catch(() => {
        /* Ignora falhas ao saír da tela cheia (ex.: navegador bloqueou por falta de gesto do usuário). */
      });
    } else {
      requestFullscreen(containerRef.current).catch(() => {
        /* Ignora falhas ao solicitar tela cheia. */
      });
    }
  }, [containerRef, isSupported]);

  return { isFullscreen, isSupported, toggleFullscreen };
}
