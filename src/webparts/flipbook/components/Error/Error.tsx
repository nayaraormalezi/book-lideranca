import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { FlipbookErrorType } from '../../models/FlipbookError';
import { IErrorProps } from './IErrorProps';
import styles from './Error.module.scss';

interface IErrorPresentation {
  iconName: string;
  title: string;
  description: string;
  canRetry: boolean;
}

/**
 * Traduz cada tipo de erro de negócio (`FlipbookErrorType`) em uma apresentação amigável.
 * Centralizar esse mapeamento aqui mantém `usePdf`/serviços livres de texto de UI.
 */
function getPresentation(type: FlipbookErrorType, technicalMessage: string): IErrorPresentation {
  switch (type) {
    case FlipbookErrorType.NotConfigured:
      return {
        iconName: 'PageEdit',
        title: 'Nenhum PDF configurado',
        description: 'Edite este Web Part e informe a URL do PDF na biblioteca de documentos do SharePoint.',
        canRetry: false
      };
    case FlipbookErrorType.FileNotFound:
      return {
        iconName: 'PageRemove',
        title: 'PDF não encontrado',
        description: `${technicalMessage} Verifique se o arquivo ainda existe e se o caminho configurado está correto.`,
        canRetry: true
      };
    case FlipbookErrorType.AccessDenied:
      return {
        iconName: 'BlockedSite',
        title: 'Acesso negado',
        description: 'Você não tem permissão para visualizar este arquivo. Solicite acesso ao proprietário da biblioteca.',
        canRetry: true
      };
    case FlipbookErrorType.ServiceUnavailable:
      return {
        iconName: 'CloudWeather',
        title: 'SharePoint indisponível',
        description: 'Não foi possível conectar ao SharePoint. Verifique sua conexão com a internet e tente novamente.',
        canRetry: true
      };
    case FlipbookErrorType.InvalidPdfFile:
      return {
        iconName: 'FileBug',
        title: 'Arquivo inválido',
        description: 'O arquivo encontrado não pôde ser interpretado como um PDF válido.',
        canRetry: true
      };
    default:
      return {
        iconName: 'Error',
        title: 'Não foi possível carregar o e-book',
        description: technicalMessage || 'Ocorreu um erro inesperado.',
        canRetry: true
      };
  }
}

/**
 * Exportado como `ErrorView` (e não `Error`) para não colidir com a classe global `Error`
 * do JavaScript ao ser importado em outros arquivos.
 */
export const ErrorView: React.FC<IErrorProps> = ({ error, onRetry }) => {
  const presentation = getPresentation(error.type, error.message);

  return (
    <div className={styles.container} role="alert">
      <Icon iconName={presentation.iconName} className={styles.icon} />
      <span className={styles.title}>{presentation.title}</span>
      <span className={styles.description}>{presentation.description}</span>
      {presentation.canRetry && onRetry && (
        <PrimaryButton className={styles.retryButton} text="Tentar novamente" onClick={onRetry} iconProps={{ iconName: 'Refresh' }} />
      )}
    </div>
  );
};
