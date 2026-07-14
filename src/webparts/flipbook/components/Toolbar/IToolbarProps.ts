export interface IToolbarProps {
  currentPage: number;
  numPages: number;

  showPageCounter: boolean;
  showZoom: boolean;
  showThumbnails: boolean;
  showFullscreen: boolean;

  onPrevPage: () => void;
  onNextPage: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;

  zoomScale: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;

  isThumbnailPanelOpen: boolean;
  onToggleThumbnails: () => void;

  isFullscreen: boolean;
  isFullscreenSupported: boolean;
  onToggleFullscreen: () => void;

  toolbarColor: string;
  primaryColor: string;
}
