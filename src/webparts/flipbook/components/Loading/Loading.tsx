import * as React from 'react';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { ILoadingProps } from './ILoadingProps';
import styles from './Loading.module.scss';

/**
 * Estado de carregamento exibido enquanto o PDF é baixado do SharePoint e processado
 * pelo PDF.js. Mantido como componente próprio (em vez de inline no `Flipbook`) para
 * poder ser reutilizado também em estados de carregamento parciais (ex.: troca de PDF).
 */
export const Loading: React.FC<ILoadingProps> = ({ label = 'Carregando e-book...', accentColor }) => {
  return (
    <div className={styles.container} role="status" aria-live="polite">
      <Spinner
        size={SpinnerSize.large}
        styles={accentColor ? { circle: { borderTopColor: accentColor } } : undefined}
      />
      <span className={styles.label}>{label}</span>
    </div>
  );
};
