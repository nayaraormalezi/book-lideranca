/**
 * Utilitários de manipulação de URLs de arquivos do SharePoint.
 */

/** Extrai apenas o nome do arquivo a partir de uma URL absoluta ou de caminho relativo ao servidor. */
export function getFileNameFromUrl(url: string): string {
  if (!url) {
    return '';
  }
  const withoutQuery = url.split('?')[0];
  const segments = withoutQuery.split('/');
  return decodeURIComponent(segments[segments.length - 1] || '');
}

/**
 * Converte uma URL absoluta (https://tenant.sharepoint.com/...) para o caminho relativo
 * ao servidor exigido pelos endpoints REST `GetFileByServerRelativePath`.
 */
export function toServerRelativeUrl(url: string, webAbsoluteUrl: string): string {
  if (!url) {
    return url;
  }

  if (!/^https?:\/\//i.test(url)) {
    // Já é relativa ao servidor (ex.: "/sites/rh/Documentos/livro.pdf").
    return url.startsWith('/') ? url : `/${url}`;
  }

  try {
    const parsed = new URL(url);
    return parsed.pathname;
  } catch {
    return url.replace(webAbsoluteUrl, '');
  }
}

/** Valida, de forma simples e barata, se a extensão do arquivo indica um PDF. */
export function hasPdfExtension(url: string): boolean {
  return /\.pdf($|\?)/i.test(url);
}
