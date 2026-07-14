import * as React from 'react';
import { Spinner, SpinnerSize } from '@fluentui/react';
import styles from '../../PdfFlipbook.module.scss';

export const Loading: React.FC<{ label?: string }> = ({ label = 'Carregando leitor...' }) => (
  <div className={styles.loading} role="status" aria-live="polite">
    <Spinner size={SpinnerSize.large} label={label} />
  </div>
);
