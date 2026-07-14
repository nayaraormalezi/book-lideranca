declare interface IFlipbookWebPartStrings {
  PropertyPaneDescription: string;

  ContentGroupName: string;
  TitleFieldLabel: string;
  PdfFilePickerLabel: string;
  PdfFilePickerButtonLabel: string;

  AppearanceGroupName: string;
  PrimaryColorFieldLabel: string;
  ToolbarColorFieldLabel: string;
  BackgroundColorFieldLabel: string;

  FeaturesGroupName: string;
  ShowThumbnailsFieldLabel: string;
  ShowZoomFieldLabel: string;
  ShowFullscreenFieldLabel: string;
  ShowPageCounterFieldLabel: string;
  OpenOnCoverFieldLabel: string;
  DoublePageModeFieldLabel: string;
}

declare module 'FlipbookWebPartStrings' {
  const strings: IFlipbookWebPartStrings;
  export = strings;
}
