/**
 * Debounce genérico e tipado, sem dependências externas (evita adicionar `lodash`
 * completo ao bundle apenas para esta função).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<TArgs extends any[]>(
  fn: (...args: TArgs) => void,
  waitMs: number
): (...args: TArgs) => void {
  let timeoutId: number | undefined;

  return (...args: TArgs): void => {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      timeoutId = undefined;
      fn(...args);
    }, waitMs);
  };
}
