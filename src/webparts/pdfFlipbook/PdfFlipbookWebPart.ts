import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { PdfFlipbook } from './components/PdfFlipbook';
import { IFlipbookProperties } from './models/IFlipbookProps';
import * as strings from 'PdfFlipbookWebPartStrings';

export default class PdfFlipbookWebPart extends BaseClientSideWebPart<IFlipbookProperties> {
  private isDarkTheme: boolean = false;

  public render(): void {
    const element: React.ReactElement = React.createElement(PdfFlipbook, {
      ...this.properties,
      context: this.context,
      isDarkTheme: this.isDarkTheme
    });
    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    this.properties.primaryColor ||= '#0078d4';
    this.properties.toolbarColor ||= '#ffffff';
    this.properties.backgroundColor ||= '#f3f2f1';
    return super.onInit();
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    this.isDarkTheme = !!currentTheme?.isInverted;
    this.render();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion() {
    return undefined;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [{
        header: { description: strings.PropertyPaneDescription },
        groups: [
          {
            groupName: strings.PdfGroupName,
            groupFields: [
              PropertyPaneTextField('pdfUrl', {
                label: strings.PdfUrlFieldLabel,
                placeholder: '/Shared Documents/publicacao.pdf'
              })
            ]
          },
          {
            groupName: strings.AppearanceGroupName,
            groupFields: [
              PropertyPaneTextField('primaryColor', { label: strings.PrimaryColorFieldLabel }),
              PropertyPaneTextField('toolbarColor', { label: strings.ToolbarColorFieldLabel }),
              PropertyPaneTextField('backgroundColor', { label: strings.BackgroundColorFieldLabel }),
              PropertyPaneToggle('showThumbnails', { label: strings.ShowThumbnailsFieldLabel }),
              PropertyPaneToggle('showZoom', { label: strings.ShowZoomFieldLabel }),
              PropertyPaneToggle('showFullscreen', { label: strings.ShowFullscreenFieldLabel }),
              PropertyPaneToggle('showPageCounter', { label: strings.ShowPageCounterFieldLabel }),
              PropertyPaneToggle('openOnCover', { label: strings.OpenOnCoverFieldLabel }),
              PropertyPaneToggle('openInDoublePage', { label: strings.OpenInDoublePageFieldLabel })
            ]
          }
        ]
      }]
    };
  }
}
