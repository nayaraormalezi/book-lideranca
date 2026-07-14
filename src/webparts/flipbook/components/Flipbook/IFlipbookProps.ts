import { IPdfDocumentInfo, IRenderedPage } from '../../models/PdfModels';
import { DeviceKind, IFlipbookFeatureFlags, IFlipbookTheme } from '../../models/FlipbookSettings';

export interface IFlipbookProps {
  documentInfo: IPdfDocumentInfo;
  pages: Record<number, IRenderedPage>;
  onRequestPage: (pageNumber: number, targetWidth: number) => void;
  onPageChange: (pageNumber: number) => void;

  theme: IFlipbookTheme;
  features: IFlipbookFeatureFlags;
  device: DeviceKind;
  containerWidth: number;
  containerHeight: number;

  /** Escala de zoom (1 = 100%) aplicada visualmente sobre o livro renderizado. */
  zoomScale: number;
}

/** API imperativa exposta via `ref`, usada pela `Toolbar`/navegação por teclado, que vivem fora do `Flipbook`. */
export interface IFlipbookHandle {
  flipNext: () => void;
  flipPrev: () => void;
  flipToFirst: () => void;
  flipToLast: () => void;
  /** @param pageNumber Número da página, 1-indexado. */
  flipToPage: (pageNumber: number) => void;
}
