/**
 * `pdfjs-dist` publica os tipos apenas para o caminho raiz do pacote, mas em builds
 * baseados em Webpack 4 (toolchain do SPFx) importamos o build "legacy" diretamente
 * (`pdfjs-dist/legacy/build/pdf`) para garantir compatibilidade com o parser/target
 * ES5 usado pelo gulp bundle. Este módulo ambiente reaproveita a tipagem pública
 * já existente do pacote, sem duplicar declarações.
 */
declare module 'pdfjs-dist/legacy/build/pdf' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export * from 'pdfjs-dist';
}
