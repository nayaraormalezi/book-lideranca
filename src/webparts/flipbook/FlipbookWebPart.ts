import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { initializeIcons } from '@fluentui/react/lib/Icons';

import { PropertyFieldColorPicker } from '@pnp/spfx-property-controls/lib/PropertyFieldColorPicker';
import { PropertyFieldFilePicker, IFilePickerResult } from '@pnp/spfx-property-controls/lib/PropertyFieldFilePicker';

import * as strings from 'FlipbookWebPartStrings';
import { FlipbookApp } from './components/FlipbookApp';
import { IFlipbookWebPartProps } from './models/IFlipbookWebPartProps';

/**
 * Ponto de entrada exigido pelo SPFx. Deliberadamente "burro": só monta/desmonta a
 * árvore React (`FlipbookApp`) e traduz o Property Pane em props tipadas. Nenhuma regra
 * de negócio (leitura do SharePoint, PDF.js, flip) vive aqui — ver `components/FlipbookApp`,
 * `services/` e `hooks/`.
 */
export default class FlipbookWebPart extends BaseClientSideWebPart<IFlipbookWebPartProps> {
  protected onInit(): Promise<void> {
    // Necessário para que os ícones do Fluent UI (`Icon`/`IconButton`) sejam resolvidos
    // corretamente quando o Web Part é renderizado isoladamente (ex.: workbench local).
    initializeIcons();
    return super.onInit();
  }

  public render(): void {
    const element: React.ReactElement<unknown> = React.createElement(FlipbookApp, {
      context: this.context,
      pdfUrl: this.properties.pdfUrl,
      primaryColor: this.properties.primaryColor || '#0078D4',
      toolbarColor: this.properties.toolbarColor || '#201F1E',
      backgroundColor: this.properties.backgroundColor || '#EDEBE9',
      showThumbnails: this.properties.showThumbnails !== false,
      showZoom: this.properties.showZoom !== false,
      showFullscreen: this.properties.showFullscreen !== false,
      showPageCounter: this.properties.showPageCounter !== false,
      openOnCover: this.properties.openOnCover !== false,
      doublePageMode: this.properties.doublePageMode !== false
    });

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  /** Persiste tanto o resultado completo do file picker (estado de UI) quanto a URL derivada (usada pela app). */
  private onPdfFileSelected = (filePickerResult: IFilePickerResult): void => {
    this.properties.pdfFilePickerResult = filePickerResult;
    this.properties.pdfUrl =
      filePickerResult.fileAbsoluteUrl || filePickerResult.fileNameWithoutExtension || this.properties.pdfUrl;
    this.render();
  };

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.ContentGroupName,
              groupFields: [
                PropertyPaneTextField('title', { label: strings.TitleFieldLabel }),
                PropertyFieldFilePicker('pdfUrl', {
                  context: this.context,
                  // O tipo público do controle exige um valor não-undefined, mas o próprio
                  // controle trata `undefined` normalmente (nenhum arquivo selecionado ainda).
                  filePickerResult: this.properties.pdfFilePickerResult as IFilePickerResult,
                  onSave: this.onPdfFileSelected,
                  onChanged: this.onPdfFileSelected,
                  accepts: ['.pdf'],
                  buttonLabel: strings.PdfFilePickerButtonLabel,
                  label: strings.PdfFilePickerLabel,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  key: 'pdfFilePickerField'
                })
              ]
            },
            {
              groupName: strings.AppearanceGroupName,
              groupFields: [
                PropertyFieldColorPicker('primaryColor', {
                  label: strings.PrimaryColorFieldLabel,
                  selectedColor: this.properties.primaryColor || '#0078D4',
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  key: 'primaryColorField'
                }),
                PropertyFieldColorPicker('toolbarColor', {
                  label: strings.ToolbarColorFieldLabel,
                  selectedColor: this.properties.toolbarColor || '#201F1E',
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  key: 'toolbarColorField'
                }),
                PropertyFieldColorPicker('backgroundColor', {
                  label: strings.BackgroundColorFieldLabel,
                  selectedColor: this.properties.backgroundColor || '#EDEBE9',
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  key: 'backgroundColorField'
                })
              ]
            },
            {
              groupName: strings.FeaturesGroupName,
              groupFields: [
                PropertyPaneToggle('showThumbnails', {
                  label: strings.ShowThumbnailsFieldLabel,
                  checked: this.properties.showThumbnails !== false
                }),
                PropertyPaneToggle('showZoom', {
                  label: strings.ShowZoomFieldLabel,
                  checked: this.properties.showZoom !== false
                }),
                PropertyPaneToggle('showFullscreen', {
                  label: strings.ShowFullscreenFieldLabel,
                  checked: this.properties.showFullscreen !== false
                }),
                PropertyPaneToggle('showPageCounter', {
                  label: strings.ShowPageCounterFieldLabel,
                  checked: this.properties.showPageCounter !== false
                }),
                PropertyPaneToggle('openOnCover', {
                  label: strings.OpenOnCoverFieldLabel,
                  checked: this.properties.openOnCover !== false
                }),
                PropertyPaneToggle('doublePageMode', {
                  label: strings.DoublePageModeFieldLabel,
                  checked: this.properties.doublePageMode !== false
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
