# SharePoint PDF Flipbook

Web Part SPFx para transformar PDFs de uma Document Library em um leitor de e-book responsivo com PDF.js e StPageFlip.

## Decisões técnicas

- **SPFx 1.21.1 + Node 22 + React 17 + Fluent UI 8**: é a última linha do SPFx que mantém o toolchain Gulp requisitado. SPFx 1.22+ usa Heft, portanto não oferece `gulp serve`, `gulp bundle` nem `gulp package-solution`.
- **PDF.js** decodifica o PDF no navegador, com a requisição autenticada feita pelo `SPHttpClient`. As permissões da biblioteca são respeitadas; não há token, senha ou URL assinada no código.
- **`react-pageflip-enhanced`** é um adaptador React TypeScript mantido do StPageFlip. Ele elimina jQuery e mantém a animação de página, capas rígidas, teclado e gestos touch.
- **Renderização preguiçosa**: o PDF é aberto uma vez, mas só a página atual e duas páginas adjacentes de cada lado são rasterizadas. O cache evita renderização repetida.

## Arquitetura

```text
src/webparts/pdfFlipbook/
├── components/
│   ├── Flipbook/          # StPageFlip e páginas do livro
│   ├── Toolbar/           # controles de navegação/zoom/tela cheia
│   ├── ThumbnailPanel/    # navegação por miniaturas
│   ├── Loading/
│   ├── Error/
│   └── PdfFlipbook.tsx    # composição da experiência
├── hooks/usePdf.ts        # ciclo de carga e cache de páginas
├── services/
│   ├── PdfService.ts      # abertura e rasterização via PDF.js
│   └── SharePointService.ts # acesso autenticado à Document Library
├── models/IFlipbookProps.ts
├── PdfFlipbookWebPart.ts  # integração SPFx e Property Pane
└── PdfFlipbookWebPart.manifest.json
```

## Instalação e desenvolvimento

Pré-requisito: Node.js 22 LTS.

```bash
npm install
npm run serve
# ou
gulp serve
```

Abra o Workbench hospedado do tenant e adicione **PDF Flipbook**. No Property Pane, informe uma URL relativa (por exemplo, `/Shared Documents/catalogo.pdf`) ou uma URL absoluta do PDF no SharePoint.

## Empacotamento

```bash
npm run bundle -- --ship
npm run package-solution -- --ship

# equivalentes solicitados:
gulp bundle --ship
gulp package-solution --ship
```

O pacote gerado é `sharepoint/solution/sharepoint-pdf-flipbook.sppkg`. Envie-o ao App Catalog e habilite a solução.

## Controles do Property Pane

| Propriedade | Descrição |
|---|---|
| URL do PDF | Caminho relativo ou absoluto de um documento da biblioteca |
| Cores principal, toolbar e fundo | Valores CSS em hexadecimal |
| Miniaturas, zoom, tela cheia e contador | Exibe/oculta cada controle |
| Abrir na capa | Define a página inicial como a capa |
| Abrir em páginas duplas | Mantém o layout de livro em telas compatíveis |

## Tratamento operacional

O leitor mostra mensagens específicas para documento inexistente (404), falta de permissão (401/403), indisponibilidade da biblioteca/falha de rede e falha de renderização do navegador. O Web Part deve ser instalado no mesmo tenant do documento ou o tenant deve permitir a origem configurada.
# book-lideranca
