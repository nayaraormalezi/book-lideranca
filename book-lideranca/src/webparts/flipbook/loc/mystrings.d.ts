declare interface IFlipbookWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  FeaturesGroupName: string;
  PdfUrlFieldLabel: string;
  PdfUrlFieldDescription: string;
  PrimaryColorFieldLabel: string;
  ToolbarColorFieldLabel: string;
  BackgroundColorFieldLabel: string;
  ShowThumbnailsFieldLabel: string;
  ShowZoomFieldLabel: string;
  ShowFullscreenFieldLabel: string;
  ShowPageCounterFieldLabel: string;
  OpenAtCoverFieldLabel: string;
  OpenInDoublePageFieldLabel: string;
  InvalidColorMessage: string;
}

declare module 'FlipbookWebPartStrings' {
  const strings: IFlipbookWebPartStrings;
  export = strings;
}
