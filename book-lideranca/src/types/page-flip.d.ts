declare module 'page-flip' {
  export interface IPageFlipEvent {
    data: number | string | boolean | object;
    object: PageFlip;
  }

  export interface IPageFlipSettings {
    startPage?: number;
    size: 'fixed' | 'stretch';
    width: number;
    height: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    swipeDistance?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
  }

  export class PageFlip {
    public constructor(element: HTMLElement, settings: IPageFlipSettings);
    public loadFromHTML(items: HTMLElement[]): void;
    public update(): void;
    public clear(): void;
    public destroy(): void;
    public turnToPage(page: number): void;
    public flip(page: number): void;
    public flipNext(): void;
    public flipPrev(): void;
    public getPageCount(): number;
    public getCurrentPageIndex(): number;
    public on(eventName: string, callback: (event: IPageFlipEvent) => void): PageFlip;
    public off(eventName: string): void;
  }
}
