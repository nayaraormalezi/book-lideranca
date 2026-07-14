import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'FlipbookWebPartStrings';
import Flipbook from './components/Flipbook/Flipbook';
import { IFlipbookProps, IFlipbookSettings } from './models';
import { PdfService } from './services/PdfService';
import { SharePointService } from './services/SharePointService';

export type IFlipbookWebPartProps = IFlipbookSettings;

export default class FlipbookWebPart extends BaseClientSideWebPart<IFlipbookWebPartProps> {
  private sharePointService!: SharePointService;
  private pdfService!: PdfService;

  public render(): void {
    const element: React.ReactElement<IFlipbookProps> = React.createElement(
      Flipbook,
      {
        ...this.properties,
        sharePointService: this.sharePointService,
        pdfService: this.pdfService
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    this.sharePointService = new SharePointService(this.context);
    this.pdfService = new PdfService();
  }

  private validateColor(value: string): string {
    if (!/^#[0-9a-f]{6}$/i.test(value.trim())) {
      return strings.InvalidColorMessage;
    }

    return '';
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('pdfUrl', {
                  label: strings.PdfUrlFieldLabel,
                  description: strings.PdfUrlFieldDescription,
                  placeholder: '/sites/portal/Documentos/livro.pdf'
                }),
                PropertyPaneTextField('primaryColor', {
                  label: strings.PrimaryColorFieldLabel,
                  onGetErrorMessage: this.validateColor.bind(this)
                }),
                PropertyPaneTextField('toolbarColor', {
                  label: strings.ToolbarColorFieldLabel,
                  onGetErrorMessage: this.validateColor.bind(this)
                }),
                PropertyPaneTextField('backgroundColor', {
                  label: strings.BackgroundColorFieldLabel,
                  onGetErrorMessage: this.validateColor.bind(this)
                })
              ]
            },
            {
              groupName: strings.FeaturesGroupName,
              groupFields: [
                PropertyPaneToggle('showThumbnails', {
                  label: strings.ShowThumbnailsFieldLabel
                }),
                PropertyPaneToggle('showZoom', {
                  label: strings.ShowZoomFieldLabel
                }),
                PropertyPaneToggle('showFullscreen', {
                  label: strings.ShowFullscreenFieldLabel
                }),
                PropertyPaneToggle('showPageCounter', {
                  label: strings.ShowPageCounterFieldLabel
                }),
                PropertyPaneToggle('openAtCover', {
                  label: strings.OpenAtCoverFieldLabel
                }),
                PropertyPaneToggle('openInDoublePage', {
                  label: strings.OpenInDoublePageFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
