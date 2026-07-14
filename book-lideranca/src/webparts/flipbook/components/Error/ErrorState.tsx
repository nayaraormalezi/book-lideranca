import * as React from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react';
import { PdfReaderError } from '../../models';
import styles from '../Flipbook/Flipbook.module.scss';

export interface IErrorStateProps {
  error: PdfReaderError;
}

const TITLES: Record<PdfReaderError['code'], string> = {
  'invalid-url': 'PDF não configurado',
  'not-found': 'PDF não encontrado',
  'access-denied': 'Acesso negado',
  'library-unavailable': 'Biblioteca indisponível',
  'invalid-pdf': 'PDF inválido',
  'unknown': 'Não foi possível abrir o PDF'
};

export const ErrorState: React.FC<IErrorStateProps> = ({ error }) => (
  <div className={styles.centeredState} role="alert">
    <MessageBar messageBarType={MessageBarType.error} isMultiline>
      <strong>{TITLES[error.code]}</strong>
      <div>{error.message}</div>
      {error.status && <div className={styles.errorDetail}>Código HTTP: {error.status}</div>}
    </MessageBar>
  </div>
);
