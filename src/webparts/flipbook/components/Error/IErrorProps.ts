import { FlipbookError } from '../../models/FlipbookError';

export interface IErrorProps {
  error: FlipbookError;
  /** Chamado quando o usuário aciona "Tentar novamente". Omitir oculta o botão. */
  onRetry?: () => void;
}
