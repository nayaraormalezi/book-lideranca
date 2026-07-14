/**
 * Decide se o texto/ícones sobre uma cor de fundo configurável (ex.: cor da Toolbar,
 * escolhida livremente pelo editor da página) deve ser claro ou escuro, usando a
 * fórmula de luminância relativa (WCAG). Evita textos ilegíveis quando o usuário
 * escolhe, por exemplo, uma Toolbar branca ou amarela no Property Pane.
 */
export function getContrastTextColor(backgroundHex: string): string {
  const rgb = hexToRgb(backgroundHex);
  if (!rgb) {
    return '#ffffff';
  }

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.6 ? '#201f1e' : '#ffffff';
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | undefined {
  const normalized = hex.replace('#', '').trim();
  const fullHex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  if (fullHex.length !== 6) {
    return undefined;
  }

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return undefined;
  }

  return { r, g, b };
}
