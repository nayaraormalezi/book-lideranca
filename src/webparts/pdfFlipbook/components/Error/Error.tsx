import * as React from 'react';
import { Icon, MessageBar, MessageBarType } from '@fluentui/react';
import styles from '../../PdfFlipbook.module.scss';

export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className={styles.error}>
    <Icon iconName="PDF" aria-hidden="true" />
    <MessageBar messageBarType={MessageBarType.error} role="alert">
      {message}
    </MessageBar>
  </div>
);
