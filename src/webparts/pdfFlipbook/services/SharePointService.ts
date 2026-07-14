import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';

/**
 * Resolves a document URL and requests it using the current user's SharePoint
 * session. This preserves library permissions and avoids exposing credentials.
 */
export class SharePointService {
  public constructor(private readonly context: WebPartContext) {}

  public async getPdfData(url: string): Promise<ArrayBuffer> {
    const absoluteUrl: string = this.resolveUrl(url);
    let response: SPHttpClientResponse;

    try {
      response = await this.context.spHttpClient.get(
        absoluteUrl,
        SPHttpClient.configurations.v1,
        { headers: { Accept: 'application/pdf' } }
      );
    } catch (error) {
      throw new Error('Não foi possível acessar a biblioteca de documentos. Verifique a conexão e tente novamente.');
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error('Você não tem permissão para visualizar este PDF.');
    }

    if (response.status === 404) {
      throw new Error('O PDF configurado não foi encontrado. Verifique a URL da biblioteca.');
    }

    if (!response.ok) {
      throw new Error(`Não foi possível carregar o PDF (HTTP ${response.status}).`);
    }

    return response.arrayBuffer();
  }

  private resolveUrl(url: string): string {
    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    const siteUrl: string = this.context.pageContext.web.absoluteUrl.replace(/\/$/, '');
    return `${siteUrl}/${url.replace(/^\//, '')}`;
  }
}
