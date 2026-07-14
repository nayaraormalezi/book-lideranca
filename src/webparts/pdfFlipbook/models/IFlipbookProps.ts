import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IFlipbookProperties {
  pdfUrl: string;
  primaryColor: string;
  toolbarColor: string;
  backgroundColor: string;
  showThumbnails: boolean;
  showZoom: boolean;
  showFullscreen: boolean;
  showPageCounter: boolean;
  openOnCover: boolean;
  openInDoublePage: boolean;
}

export interface IFlipbookProps extends IFlipbookProperties {
  context: WebPartContext;
  isDarkTheme: boolean;
}

export interface IPdfPage {
  pageNumber: number;
  width: number;
  height: number;
  render: (targetWidth: number, scale?: number) => Promise<string>;
}

export interface IPdfDocument {
  numPages: number;
  pages: IPdfPage[];
}
