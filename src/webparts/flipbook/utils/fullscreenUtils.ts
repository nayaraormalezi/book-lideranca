/**
 * Pequena camada de compatibilidade sobre a Fullscreen API. Navegadores mais antigos
 * (e alguns Safari) ainda expõem as APIs de tela cheia com prefixo de fornecedor;
 * este módulo evita espalhar esses `as any` por todo o código dos componentes.
 */
interface IVendorPrefixedDocument extends Document {
  webkitFullscreenElement?: Element;
  msFullscreenElement?: Element;
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface IVendorPrefixedElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

export function isFullscreenSupported(): boolean {
  const doc = document as IVendorPrefixedDocument;
  return !!(
    document.fullscreenEnabled ||
    doc.webkitExitFullscreen ||
    doc.msExitFullscreen
  );
}

export function getFullscreenElement(): Element | null {
  const doc = document as IVendorPrefixedDocument;
  return document.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement || null;
}

export async function requestFullscreen(element: HTMLElement): Promise<void> {
  const el = element as IVendorPrefixedElement;
  if (el.requestFullscreen) {
    await el.requestFullscreen();
  } else if (el.webkitRequestFullscreen) {
    await el.webkitRequestFullscreen();
  } else if (el.msRequestFullscreen) {
    await el.msRequestFullscreen();
  }
}

export async function exitFullscreen(): Promise<void> {
  const doc = document as IVendorPrefixedDocument;
  if (document.exitFullscreen) {
    await document.exitFullscreen();
  } else if (doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen();
  } else if (doc.msExitFullscreen) {
    await doc.msExitFullscreen();
  }
}
