/**
 * O pacote `page-flip` (motor de flip usado pelo `Flipbook`) é escrito em TypeScript,
 * mas a versão publicada no npm (2.0.7) não inclui os arquivos `.d.ts` compilados.
 * Esta declaração ambiente cobre exatamente a superfície pública utilizada por este
 * projeto, com base no código-fonte oficial (github.com/Nodlik/StPageFlip).
 */
declare module 'page-flip' {
  export type PageFlipSizeType = 'fixed' | 'stretch';

  export interface IFlipSetting {
    startPage: number;
    size: PageFlipSizeType;
    width: number;
    height: number;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    drawShadow: boolean;
    flippingTime: number;
    usePortrait: boolean;
    startZIndex: number;
    autoSize: boolean;
    maxShadowOpacity: number;
    showCover: boolean;
    mobileScrollSupport: boolean;
    clickEventForward: boolean;
    useMouseEvents: boolean;
    swipeDistance: number;
    showPageCorners: boolean;
    disableFlipByClick: boolean;
  }

  export type PageFlipEventData = number | string | boolean | Record<string, unknown>;

  export interface IPageFlipEvent {
    data: PageFlipEventData;
    object: PageFlip;
  }

  export type PageFlipEventCallback = (event: IPageFlipEvent) => void;

  export class PageFlip {
    constructor(element: HTMLElement, setting: Partial<IFlipSetting>);

    loadFromImages(imagesHref: string[]): void;
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    updateFromImages(imagesHref: string[]): void;
    updateFromHtml(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    clear(): void;
    destroy(): void;
    update(): void;

    turnToPrevPage(): void;
    turnToNextPage(): void;
    turnToPage(page: number): void;
    flipNext(corner?: 'top' | 'bottom'): void;
    flipPrev(corner?: 'top' | 'bottom'): void;
    flip(page: number, corner?: 'top' | 'bottom'): void;

    getPageCount(): number;
    getCurrentPageIndex(): number;
    getOrientation(): 'portrait' | 'landscape';
    getSettings(): IFlipSetting;

    on(eventName: 'flip', callback: PageFlipEventCallback): PageFlip;
    on(eventName: 'changeOrientation', callback: PageFlipEventCallback): PageFlip;
    on(eventName: 'changeState', callback: PageFlipEventCallback): PageFlip;
    on(eventName: 'init', callback: PageFlipEventCallback): PageFlip;
    on(eventName: 'update', callback: PageFlipEventCallback): PageFlip;
    on(eventName: string, callback: PageFlipEventCallback): PageFlip;

    off(eventName: string): void;
  }
}
