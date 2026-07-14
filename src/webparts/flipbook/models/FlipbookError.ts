/**
 * Taxonomia de erros de negócio do Web Part. Mapear os erros para tipos
 * conhecidos permite que a UI (componente `Error`) exiba mensagens e ícones
 * específicos em vez de uma mensagem genérica de falha.
 */
export enum FlipbookErrorType {
  /** Nenhuma URL de PDF foi configurada no Property Pane. */
  NotConfigured = 'NotConfigured',
  /** O arquivo não existe no caminho informado (HTTP 404). */
  FileNotFound = 'FileNotFound',
  /** O usuário autenticado não tem permissão de leitura no arquivo/biblioteca (HTTP 401/403). */
  AccessDenied = 'AccessDenied',
  /** O SharePoint/rede está indisponível ou a requisição expirou. */
  ServiceUnavailable = 'ServiceUnavailable',
  /** O arquivo foi encontrado, mas não é um PDF válido/legível pelo PDF.js. */
  InvalidPdfFile = 'InvalidPdfFile',
  /** Qualquer outra falha não classificada. */
  Unknown = 'Unknown'
}

/**
 * Erro tipado usado em toda a camada de serviços/hooks. Permite que a camada de apresentação
 * decida o texto e a ação de recuperação exibidos sem precisar inspecionar mensagens de string.
 */
export class FlipbookError extends Error {
  public readonly type: FlipbookErrorType;
  public readonly cause?: Error;

  constructor(type: FlipbookErrorType, message: string, cause?: Error) {
    super(message);
    this.name = 'FlipbookError';
    this.type = type;
    this.cause = cause;

    // Necessário para que `instanceof FlipbookError` funcione corretamente após transpilação para ES5.
    Object.setPrototypeOf(this, FlipbookError.prototype);
  }

  public static fromHttpStatus(status: number, fileName: string, cause?: Error): FlipbookError {
    switch (status) {
      case 401:
      case 403:
        return new FlipbookError(
          FlipbookErrorType.AccessDenied,
          `Acesso negado ao arquivo "${fileName}".`,
          cause
        );
      case 404:
        return new FlipbookError(
          FlipbookErrorType.FileNotFound,
          `Arquivo "${fileName}" não foi encontrado.`,
          cause
        );
      case 0:
      case 502:
      case 503:
      case 504:
        return new FlipbookError(
          FlipbookErrorType.ServiceUnavailable,
          'O SharePoint está indisponível no momento.',
          cause
        );
      default:
        return new FlipbookError(
          FlipbookErrorType.Unknown,
          `Falha inesperada (HTTP ${status}) ao carregar "${fileName}".`,
          cause
        );
    }
  }
}
