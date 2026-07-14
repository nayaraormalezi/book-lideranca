import { IRenderedPage } from '../../models/PdfModels';

export interface IThumbnailPanelProps {
  isOpen: boolean;
  onDismiss: () => void;
  numPages: number;
  currentPage: number;
  thumbnails: Record<number, IRenderedPage>;
  onRequestThumbnail: (pageNumber: number) => void;
  onSelectPage: (pageNumber: number) => void;
  primaryColor: string;
}
