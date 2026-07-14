import { IFilePickerResult } from '@pnp/spfx-property-controls/lib/PropertyFieldFilePicker';

/**
 * Propriedades configuráveis do Web Part através do Property Pane.
 * Cada campo aqui tem um controle correspondente em `FlipbookWebPart.ts`.
 */
export interface IFlipbookWebPartProps {
  /** Título exibido acima do leitor (opcional). */
  title: string;

  /** URL (absoluta ou relativa ao servidor) do arquivo PDF na Document Library. */
  pdfUrl: string;

  /**
   * Estado interno do controle `PropertyFieldFilePicker` (PnP), usado apenas para o
   * Property Pane lembrar/exibir o arquivo selecionado. A aplicação em si (`FlipbookApp`)
   * consome somente `pdfUrl`, mantendo a UI React independente deste tipo do PnP.
   */
  pdfFilePickerResult?: IFilePickerResult;

  /** Cor principal: botões ativos, destaque de seleção, barra de progresso. */
  primaryColor: string;

  /** Cor de fundo da Toolbar superior/inferior. */
  toolbarColor: string;

  /** Cor de fundo da área de leitura (atrás do livro). */
  backgroundColor: string;

  /** Exibe/oculta o painel de miniaturas. */
  showThumbnails: boolean;

  /** Exibe/oculta os controles de zoom. */
  showZoom: boolean;

  /** Exibe/oculta o botão de tela cheia. */
  showFullscreen: boolean;

  /** Exibe/oculta o contador "Página X de Y". */
  showPageCounter: boolean;

  /** Quando verdadeiro, a primeira página (capa) é exibida sozinha antes do modo livro. */
  openOnCover: boolean;

  /** Quando verdadeiro, o miolo do livro (após a capa) é exibido em páginas duplas no desktop. */
  doublePageMode: boolean;
}
