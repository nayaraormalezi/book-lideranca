/**
 * Modelos de domínio relacionados ao documento PDF carregado.
 * Mantidos livres de dependências de UI para poderem ser reutilizados
 * por qualquer serviço, hook ou componente.
 */

/** Dimensões de uma página do PDF, usadas para reservar espaço (layout) antes da renderização. */
export interface IPdfPageSize {
  width: number;
  height: number;
}

/** Metadados essenciais do documento, resolvidos uma única vez após o carregamento. */
export interface IPdfDocumentInfo {
  /** Número total de páginas do documento. */
  numPages: number;

  /** Tamanho (em pontos) da primeira página — usado como referência de proporção do livro. */
  firstPageSize: IPdfPageSize;

  /** Nome do arquivo, derivado da URL, exibido em mensagens de erro/carregamento. */
  fileName: string;
}

/** Estado de renderização de uma página individual (cache em memória). */
export type PageRenderStatus = 'pending' | 'rendering' | 'rendered' | 'error';

export interface IRenderedPage {
  pageNumber: number;
  status: PageRenderStatus;
  /** Data URL (image/png ou image/webp) já pronta para uso em <img> ou como textura do flipbook. */
  dataUrl?: string;
  size: IPdfPageSize;
}

/** Opções de renderização usadas pelo PdfService ao converter uma página em imagem. */
export interface IRenderPageOptions {
  pageNumber: number;
  /** Largura alvo em pixels CSS; a altura é calculada preservando a proporção da página. */
  targetWidth: number;
  /** Fator de escala do dispositivo (window.devicePixelRatio), para nitidez em telas retina. */
  devicePixelRatio?: number;
}
