import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { ISharePointService, PdfReaderError } from '../models';

const PDF_HEADER = '%PDF-';

export class SharePointService implements ISharePointService {
  public constructor(private readonly context: WebPartContext) {}

  public async getPdf(pdfUrl: string): Promise<ArrayBuffer> {
    const requestUrl = this.resolveUrl(pdfUrl);
    let response: SPHttpClientResponse;

    try {
      response = await this.context.spHttpClient.get(
        requestUrl,
        SPHttpClient.configurations.v1,
        {
          headers: {
            Accept: 'application/pdf'
          }
        }
      );
    } catch (error) {
      throw new PdfReaderError(
        'library-unavailable',
        'Não foi possível acessar a biblioteca de documentos.',
        undefined,
        error
      );
    }

    if (!response.ok) {
      throw this.mapHttpError(response.status);
    }

    const data = await response.arrayBuffer();
    this.validatePdf(data);
    return data;
  }

  private resolveUrl(pdfUrl: string): string {
    const value = pdfUrl.trim();
    if (!value) {
      throw new PdfReaderError('invalid-url', 'Configure a URL de PDF no painel de propriedades.');
    }

    let url: URL;
    try {
      url = new URL(value, this.context.pageContext.web.absoluteUrl);
    } catch (error) {
      throw new PdfReaderError('invalid-url', 'A URL configurada para o PDF é inválida.', undefined, error);
    }

    if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
      throw new PdfReaderError('invalid-url', 'A URL do PDF deve utilizar HTTPS.');
    }

    return url.toString();
  }

  private mapHttpError(status: number): PdfReaderError {
    if (status === 401 || status === 403) {
      return new PdfReaderError(
        'access-denied',
        'Você não tem permissão para acessar este PDF.',
        status
      );
    }

    if (status === 404) {
      return new PdfReaderError(
        'not-found',
        'O PDF não foi encontrado. Verifique a URL e se o arquivo ainda existe.',
        status
      );
    }

    return new PdfReaderError(
      'library-unavailable',
      'A biblioteca de documentos está indisponível no momento.',
      status
    );
  }

  private validatePdf(data: ArrayBuffer): void {
    if (data.byteLength < PDF_HEADER.length) {
      throw new PdfReaderError('invalid-pdf', 'O arquivo retornado está vazio ou não é um PDF válido.');
    }

    const bytes = new Uint8Array(data, 0, PDF_HEADER.length);
    const signature = Array.from(bytes)
      .map(byte => String.fromCharCode(byte))
      .join('');

    if (signature !== PDF_HEADER) {
      throw new PdfReaderError(
        'invalid-pdf',
        'O endereço informado não retornou um arquivo PDF válido.'
      );
    }
  }
}
