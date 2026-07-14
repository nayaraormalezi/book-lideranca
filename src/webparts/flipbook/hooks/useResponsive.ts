import { RefObject, useEffect, useState } from 'react';
import { DeviceKind } from '../models/FlipbookSettings';
import { getDeviceKind } from '../utils/deviceUtils';
import { debounce } from '../utils/debounce';
import { FLIPBOOK_CONSTANTS } from '../utils/constants';

export interface IResponsiveState {
  device: DeviceKind;
  containerWidth: number;
  containerHeight: number;
}

/**
 * Observa o tamanho do próprio contêiner do Web Part (via `ResizeObserver`) em vez do
 * `window`, pois o Web Part pode estar em uma coluna estreita de uma página com várias
 * colunas — a experiência responsiva deve reagir ao espaço real disponível, não à
 * largura da janela do navegador.
 */
export function useResponsive(containerRef: RefObject<HTMLElement>): IResponsiveState {
  const [state, setState] = useState<IResponsiveState>({
    device: 'desktop',
    containerWidth: 0,
    containerHeight: 0
  });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const update = debounce((width: number, height: number) => {
      setState({ device: getDeviceKind(width), containerWidth: width, containerHeight: height });
    }, FLIPBOOK_CONSTANTS.RESIZE_DEBOUNCE_MS);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        update(width, height);
      }
    });

    observer.observe(element);

    // Medição inicial imediata (sem debounce) para evitar um primeiro frame com tamanho zero.
    const rect = element.getBoundingClientRect();
    setState({ device: getDeviceKind(rect.width), containerWidth: rect.width, containerHeight: rect.height });

    return () => observer.disconnect();
  }, [containerRef]);

  return state;
}
