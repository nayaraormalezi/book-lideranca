import * as React from 'react';
import { ProgressIndicator, Spinner, SpinnerSize } from '@fluentui/react';
import styles from '../Flipbook/Flipbook.module.scss';

export interface ILoadingProps {
  label: string;
  progress?: number;
}

export const Loading: React.FC<ILoadingProps> = ({ label, progress }) => (
  <div className={styles.centeredState} role="status" aria-live="polite">
    <Spinner size={SpinnerSize.large} label={label} />
    {typeof progress === 'number' && progress > 0 && progress < 100 && (
      <ProgressIndicator
        className={styles.progress}
        percentComplete={progress / 100}
        ariaValueText={`${progress}%`}
      />
    )}
  </div>
);
