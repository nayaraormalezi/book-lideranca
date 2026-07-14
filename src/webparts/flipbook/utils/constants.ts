/**
 * Constantes centralizadas para evitar "números mágicos" espalhados pelo código
 * e facilitar ajuste fino de performance/UX em um único lugar.
 */
export const FLIPBOOK_CONSTANTS = {
  /** Breakpoints (px) usados para decidir o layout responsivo (mobile/tablet/desktop). */
  BREAKPOINT_MOBILE_MAX: 640,
  BREAKPOINT_TABLET_MAX: 1024,

  /** Quantidade de páginas renderizadas para cada lado da página atual (janela de lazy-render). */
  RENDER_WINDOW_RADIUS: 2,

  /** Largura alvo (px CSS) usada ao rasterizar uma página para exibição em tamanho normal. */
  PAGE_RENDER_TARGET_WIDTH: 900,

  /** Largura alvo (px CSS) usada ao gerar miniaturas — bem menor para renderizar rapidamente. */
  THUMBNAIL_TARGET_WIDTH: 160,

  /** Limites de zoom aplicados sobre a área de leitura. */
  ZOOM_MIN_SCALE: 1,
  ZOOM_MAX_SCALE: 3,
  ZOOM_STEP: 0.25,

  /** Tempo (ms) usado para "debounce" de eventos de redimensionamento de janela. */
  RESIZE_DEBOUNCE_MS: 200,

  /** Tamanho máximo (bytes) aceito para um PDF antes de avisar o usuário sobre performance. */
  LARGE_FILE_WARNING_BYTES: 50 * 1024 * 1024,

  /** Proporção padrão (largura/altura) usada como placeholder antes de conhecer o tamanho real da página. */
  DEFAULT_PAGE_ASPECT_RATIO: 0.7071 // A4 retrato aproximado
} as const;

export const PDF_WORKER_CDN_URL =
  'https://unpkg.com/pdfjs-dist@3.11.174/legacy/build/pdf.worker.min.js';
