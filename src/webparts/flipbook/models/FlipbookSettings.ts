/**
 * Subconjunto de `IFlipbookWebPartProps` relevante para a camada visual (componentes React).
 * Isolar essa interface evita que os componentes de apresentação dependam do tipo completo
 * de propriedades do Web Part (que inclui `pdfUrl`, usado apenas pela camada de dados).
 */
export interface IFlipbookTheme {
  primaryColor: string;
  toolbarColor: string;
  backgroundColor: string;
}

export interface IFlipbookFeatureFlags {
  showThumbnails: boolean;
  showZoom: boolean;
  showFullscreen: boolean;
  showPageCounter: boolean;
  openOnCover: boolean;
  doublePageMode: boolean;
}

/** Estado de zoom aplicado à área de leitura. */
export interface IZoomState {
  scale: number;
  minScale: number;
  maxScale: number;
}

export type DeviceKind = 'desktop' | 'tablet' | 'mobile';
