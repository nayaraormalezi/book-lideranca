import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { FlipbookError, FlipbookErrorType } from '../models/FlipbookError';
import { getFileNameFromUrl, toServerRelativeUrl } from '../utils/urlUtils';
import { FLIPBOOK_CONSTANTS } from '../utils/constants';

interface ISharePointFileMetadata {
  Exists: boolean;
  Length: string;
  Name: string;
}

export interface IPdfFileResult {
  arrayBuffer: ArrayBuffer;
  fileName: string;
  sizeInBytes: number;
  isLargeFile: boolean;
}

/**
 * Isola todo o acesso ao SharePoint (REST) em uma única camada de serviço.
 * Nenhum componente React ou hook fala diretamente com `SPHttpClient` — isso mantém
 * a lógica de autenticação/erros de rede centralizada e fácil de testar/trocar
 * (ex.: se um dia migrar para @pnp/sp, só este arquivo muda).
 */
export class SharePointService {
  constructor(private readonly context: WebPartContext) {}

  /**
   * Baixa o conteúdo binário de um PDF a partir de uma Document Library do SharePoint.
   * Primeiro valida existência/permissão via metadados (chamada leve) e só então baixa
   * o binário completo, para conseguir diferenciar 404 de 403 com uma mensagem clara.
   */
  public async getPdfFile(fileUrl: string): Promise<IPdfFileResult> {
    if (!fileUrl || fileUrl.trim().length === 0) {
      throw new FlipbookError(
        FlipbookErrorType.NotConfigured,
        'Nenhum arquivo PDF foi configurado para este Web Part.'
      );
    }

    const webAbsoluteUrl = this.context.pageContext.web.absoluteUrl;
    const serverRelativeUrl = toServerRelativeUrl(fileUrl, webAbsoluteUrl);
    const fileName = getFileNameFromUrl(serverRelativeUrl);
    const encodedPath = encodeURIComponent(serverRelativeUrl).replace(/'/g, "''");

    const metadata = await this.fetchMetadata(webAbsoluteUrl, encodedPath, fileName);

    if (!metadata.Exists) {
      throw new FlipbookError(
        FlipbookErrorType.FileNotFound,
        `O arquivo "${fileName}" não foi encontrado na biblioteca do SharePoint.`
      );
    }

    const sizeInBytes = parseInt(metadata.Length, 10) || 0;
    const arrayBuffer = await this.fetchBinary(webAbsoluteUrl, encodedPath, fileName);

    return {
      arrayBuffer,
      fileName,
      sizeInBytes,
      isLargeFile: sizeInBytes > FLIPBOOK_CONSTANTS.LARGE_FILE_WARNING_BYTES
    };
  }

  private async fetchMetadata(
    webAbsoluteUrl: string,
    encodedServerRelativePath: string,
    fileName: string
  ): Promise<ISharePointFileMetadata> {
    const endpoint =
      `${webAbsoluteUrl}/_api/web/GetFileByServerRelativePath(decodedurl='${encodedServerRelativePath}')` +
      `?$select=Exists,Length,Name`;

    let response: SPHttpClientResponse;
    try {
      response = await this.context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
    } catch (error) {
      throw new FlipbookError(
        FlipbookErrorType.ServiceUnavailable,
        'Não foi possível conectar ao SharePoint. Verifique sua conexão e tente novamente.',
        error as Error
      );
    }

    if (!response.ok) {
      throw FlipbookError.fromHttpStatus(response.status, fileName);
    }

    return (await response.json()) as ISharePointFileMetadata;
  }

  private async fetchBinary(
    webAbsoluteUrl: string,
    encodedServerRelativePath: string,
    fileName: string
  ): Promise<ArrayBuffer> {
    const endpoint =
      `${webAbsoluteUrl}/_api/web/GetFileByServerRelativePath(decodedurl='${encodedServerRelativePath}')/$value`;

    let response: SPHttpClientResponse;
    try {
      response = await this.context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1, {
        headers: { Accept: 'application/octet-stream' }
      });
    } catch (error) {
      throw new FlipbookError(
        FlipbookErrorType.ServiceUnavailable,
        'Não foi possível conectar ao SharePoint. Verifique sua conexão e tente novamente.',
        error as Error
      );
    }

    if (!response.ok) {
      throw FlipbookError.fromHttpStatus(response.status, fileName);
    }

    try {
      return await response.arrayBuffer();
    } catch (error) {
      throw new FlipbookError(
        FlipbookErrorType.Unknown,
        `Falha ao ler o conteúdo do arquivo "${fileName}".`,
        error as Error
      );
    }
  }
}
