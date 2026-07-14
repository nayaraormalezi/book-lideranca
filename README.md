# Flipbook PDF Viewer — SPFx Web Part

Web Part para **SharePoint Online** que transforma um PDF armazenado em uma
biblioteca de documentos em um leitor de e-book profissional, com efeito
realista de virar páginas (estilo FlippingBook/Issuu), usando apenas
bibliotecas **gratuitas e open source**.

Stack: **SharePoint Framework (SPFx) 1.21.1 · React 17 · TypeScript 5.3 ·
PDF.js · page-flip · Fluent UI (`@fluentui/react` v8) · @pnp/spfx-property-controls**.

---

## Sumário

1. [Planejamento técnico e decisões de arquitetura](#1-planejamento-técnico-e-decisões-de-arquitetura)
2. [Análise: StPageFlip vs. alternativas](#2-análise-stpageflip-vs-alternativas)
3. [Estrutura do projeto](#3-estrutura-do-projeto)
4. [Como cada peça funciona](#4-como-cada-peça-funciona)
5. [Property Pane (configuração)](#5-property-pane-configuração)
6. [Requisitos de ambiente](#6-requisitos-de-ambiente)
7. [Comandos](#7-comandos)
8. [Implantação em produção](#8-implantação-em-produção)
9. [Limitações conhecidas e próximos passos](#9-limitações-conhecidas-e-próximos-passos)

---

## 1. Planejamento técnico e decisões de arquitetura

### Objetivo
Ler um PDF diretamente de uma Document Library do SharePoint Online e
apresentá-lo como um livro digital: capa isolada, miolo em página dupla,
zoom, tela cheia, miniaturas, navegação por teclado/mouse/swipe, contador de
página, totalmente responsivo e com carregamento **lazy** das páginas (para
suportar PDFs grandes sem travar o navegador).

### Princípios seguidos
- **Separação de responsabilidades (SOLID)**: nenhuma camada conhece
  detalhes da camada vizinha além do necessário.
  - `services/SharePointService` → só sabe falar com a REST API do SharePoint.
  - `services/PdfService` → só sabe falar com o PDF.js.
  - `hooks/usePdf` → orquestra as duas services e expõe um cache de páginas
    reativo para a UI, sem saber nada de React DOM/CSS.
  - `components/Flipbook` → só sabe renderizar o motor de flip (`page-flip`),
    recebendo páginas já rasterizadas via props.
  - `components/FlipbookApp` → orquestrador que liga hooks + componentes de
    apresentação; é o único lugar que "conhece" todo o fluxo.
  - `FlipbookWebPart.ts` → **só** traduz o Property Pane do SPFx em props
    tipadas e monta/desmonta a árvore React. Não contém lógica de negócio.
- **Componentes controlados e sem estado escondido**: `Toolbar`, `Loading`,
  `ErrorView` e `ThumbnailPanel` não têm estado próprio relevante — tudo vem
  de props, o que os torna fáceis de testar e reutilizar.
- **Erros tipados** (`FlipbookError` / `FlipbookErrorType`) em vez de strings
  soltas, permitindo que a camada de apresentação decida ícone/texto/ação por
  tipo de erro (PDF inexistente, sem permissão, serviço indisponível, PDF
  corrompido, não configurado).
- **Nenhuma dependência abandonada ou baseada em jQuery/Turn.js.**

---

## 2. Análise: StPageFlip vs. alternativas

Antes de implementar, foi feita uma pesquisa deliberada por alternativas mais
modernas ao `StPageFlip`, conforme solicitado. Resumo da análise:

| Biblioteca | Situação | Avaliação |
|---|---|---|
| `page-flip` (core do StPageFlip, mesmo autor) | Sem novas releases desde 2021, porém **801★ no GitHub, ~67K downloads semanais no npm, zero dependências, 17 dependentes, TypeScript**. API estável e amplamente adotada em produção. | ✅ **Escolhida** |
| `react-pageflip` (wrapper React do StPageFlip) | Mesma base do `page-flip`, mas a camada de wrapper em si está sem manutenção e é mais limitada para customização fina (zoom, lazy loading, `ref` imperativo). | ❌ Preferimos consumir `page-flip` diretamente com um wrapper React próprio (`components/Flipbook`), obtendo controle total (zoom, lazy render, tema) sem depender de uma segunda camada não mantida. |
| Pacotes "modernos" publicados em 2026 (`@flipbookjs/react-viewer`, `pdf-flipbook`, `@maxvankuik/flipbook-viewer`) | Publicados há poucas semanas/meses, **0–5 downloads semanais, 0 estrelas/forks, 1 contribuidor, histórico de versionamento incomum** (ex.: saltos de v1 → v3 em poucos dias). | ❌ Descartadas: não atendem a um padrão mínimo de maturidade/confiabilidade para uso corporativo — o risco de abandono ou de bugs não descobertos é maior do que o de uma biblioteca "parada, porém estável e amplamente testada em produção". |
| `Turn.js` | Depende de jQuery, sem atualizações há anos, licenciamento restritivo em versões antigas. | ❌ Explicitamente descartada pelo requisito do projeto. |

**Conclusão**: `page-flip` continua sendo a opção mais equilibrada entre
robustez, ausência de dependências transitivas (`0 dependencies`) e
maturidade comprovada em produção. Como o pacote publicado no npm não inclui
mais os arquivos `.d.ts` (a versão 2.0.7 é de 2021, antes da distribuição
consistente de tipos), foi criada uma declaração de tipos ambiente própria em
[`src/webparts/flipbook/types/page-flip.d.ts`](src/webparts/flipbook/types/page-flip.d.ts),
espelhando fielmente a API pública do código-fonte oficial
(`github.com/Nodlik/StPageFlip`). Isso garante tipagem forte sem introduzir
uma dependência extra "moderna", mas de procedência incerta.

O `page-flip` é usado **diretamente** (sem o wrapper `react-pageflip`),
encapsulado por `components/Flipbook`, que:
- Cria/destroi a instância a cada troca de documento ou de "família" de
  dispositivo (mobile/tablet/desktop);
- Alimenta o motor com um array de imagens (`loadFromImages`), usando um
  placeholder leve para páginas ainda não rasterizadas — é exatamente esse
  mecanismo que implementa o **lazy loading real da rasterização do PDF**
  (não confundir com lazy loading de imagens já prontas);
  atualiza esse array via `updateFromImages` conforme o PDF.js termina de
  gerar cada página, sem nunca recriar a instância (preserva a página atual);
- Expõe uma API imperativa (`flipNext`, `flipPrev`, `flipToPage`, ...) via
  `React.forwardRef`, para que `Toolbar`, teclado e miniaturas — que vivem
  fora do `Flipbook` — possam controlá-lo.

---

## 3. Estrutura do projeto

```
src/webparts/flipbook/
 ├── components/
 │     FlipbookApp/     orquestrador (hooks + componentes de apresentação)
 │     Flipbook/        motor de flip (page-flip) + zoom
 │     Toolbar/         barra de navegação/zoom/miniaturas/tela cheia
 │     ThumbnailPanel/  painel lateral de miniaturas (virtualizado)
 │     Loading/         estado de carregamento
 │     Error/           estado de erro (tipado por FlipbookErrorType)
 │
 ├── hooks/
 │     usePdf.ts               ciclo de vida do documento + cache de páginas
 │     useFullscreen.ts        Fullscreen API com fallback de navegadores
 │     useZoom.ts              estado de zoom (in/out/reset)
 │     useResponsive.ts        ResizeObserver do próprio contêiner
 │     useKeyboardNavigation.ts atalhos de teclado (setas, Home/End, +/-, F)
 │
 ├── services/
 │     PdfService.ts           wrapper do PDF.js (parse + rasterização lazy)
 │     SharePointService.ts    leitura do PDF via REST do SharePoint
 │
 ├── models/            interfaces/tipos (props, erros, domínio do PDF)
 ├── utils/              constantes, cores, device, fullscreen, debounce, URL
 ├── types/              declarações ambiente (page-flip, pdfjs-dist legacy)
 ├── loc/                 strings localizadas (pt-br / en-us)
 │
 ├── FlipbookWebPart.ts             ponto de entrada do Web Part (SPFx)
 └── FlipbookWebPart.manifest.json  manifesto do componente
```

---

## 4. Como cada peça funciona

### Leitura do PDF (`SharePointService`)
1. Resolve a URL configurada (absoluta ou relativa) para um caminho relativo
   ao servidor.
2. Consulta `_api/web/GetFileByServerRelativePath(...)?$select=Exists,Length,Name`
   para validar existência **antes** de baixar o binário — permite
   diferenciar claramente **404 (arquivo inexistente)** de **403/401 (sem
   permissão)** e de falhas de rede/serviço.
3. Baixa o conteúdo binário via `.../$value` usando `SPHttpClient` (contexto
   autenticado do próprio Web Part — nenhuma credencial extra é necessária).
4. Qualquer falha é convertida em um `FlipbookError` tipado
   (`NotConfigured`, `FileNotFound`, `AccessDenied`, `ServiceUnavailable`,
   `InvalidPdfFile`, `Unknown`).

### Parsing e rasterização (`PdfService`)
- Usa `pdfjs-dist` (build `legacy`, compatível com o Webpack 4 do toolchain
  SPFx) para abrir o documento a partir do `ArrayBuffer` retornado pelo
  `SharePointService`.
- O worker do PDF.js é carregado de um CDN (`unpkg`) com a **mesma versão
  exata** do pacote instalado — evita ter que empacotar um Web Worker pelo
  Webpack 4 do SPFx (que não suporta bem `worker-loader`/`new Worker(new
  URL(...))` nessa versão do toolchain).
- Cada página é rasterizada sob demanda, em um `<canvas>` off-screen, e
  convertida para uma `data:` URL (JPEG) — só o resultado final fica em
  memória, o canvas é descartado imediatamente.

### Lazy loading / "renderizar somente o necessário"
- `usePdf` mantém **dois caches independentes**: um para páginas em
  resolução de leitura e outro para miniaturas (larguras diferentes, para
  que uma não sobrescreva a outra).
- `Flipbook` só solicita a rasterização de uma **janela** de páginas ao redor
  da página atual (`FLIPBOOK_CONSTANTS.RENDER_WINDOW_RADIUS`, padrão ±2).
  Páginas fora dessa janela recebem um placeholder leve (SVG inline) — o
  PDF.js não é acionado para elas até que o usuário navegue até perto delas.
- `ThumbnailPanel` usa o componente `List` do Fluent UI, que **virtualiza a
  lista** (só monta os itens realmente visíveis no painel). Cada miniatura
  só dispara sua própria rasterização quando é efetivamente montada — ou
  seja, mesmo um PDF com centenas de páginas nunca rasteriza todas as
  miniaturas de uma vez.

### Motor de flip (`Flipbook` + `page-flip`)
Ver seção 2 acima. Capa isolada (`showCover`) e página dupla
(`usePortrait: !doublePageMode`) são strings diretamente derivadas das
opções do Property Pane.

### Zoom, tela cheia, teclado e swipe
- **Zoom** (`useZoom`): escala aplicada via CSS `transform: scale(...)` sobre
  o contêiner do livro; o wrapper externo usa `overflow: auto`, permitindo
  arrastar/rolar para "panorâmica" quando ampliado — sem necessidade de
  lógica de pan customizada.
- **Tela cheia** (`useFullscreen`): usa a Fullscreen API nativa com
  fallbacks de prefixo de fornecedor (Safari/IE legado), aplicada ao
  contêiner do Web Part (não à página inteira).
- **Teclado** (`useKeyboardNavigation`): o handler é aplicado via `onKeyDown`
  no contêiner do leitor (`tabIndex={0}`), e **não** em um listener global de
  `document` — evita capturar teclas de outros Web Parts/campos de texto na
  mesma página do SharePoint. Atalhos: `←`/`→` (página anterior/próxima),
  `Home`/`End` (primeira/última página), `+`/`-` (zoom), `F` (tela cheia).
- **Swipe mobile**: nativo do `page-flip` (`useMouseEvents`,
  `mobileScrollSupport: false` para priorizar o gesto de virar página sobre o
  scroll vertical em telas de toque).

### Responsividade
`useResponsive` usa `ResizeObserver` no **próprio elemento raiz** do Web
Part (não em `window`), pois o Web Part pode estar em uma coluna estreita de
uma página com múltiplas colunas — a experiência precisa reagir ao espaço
real disponível, não à largura da janela do navegador.

---

## 5. Property Pane (configuração)

| Campo | Tipo de controle | Descrição |
|---|---|---|
| Título | Texto | Rótulo opcional (não exibido pela UI atual, reservado para uso futuro em cabeçalhos). |
| Arquivo PDF | `PropertyFieldFilePicker` (PnP) | Navega pelas bibliotecas do site atual e seleciona o PDF diretamente — sem precisar copiar/colar URLs. |
| Cor principal | `PropertyFieldColorPicker` (PnP) | Cor de destaque (ex.: contorno de miniatura selecionada). |
| Cor da barra de ferramentas | `PropertyFieldColorPicker` (PnP) | Fundo da `Toolbar`; o texto/ícones trocam automaticamente entre claro/escuro conforme o contraste (WCAG). |
| Cor de fundo | `PropertyFieldColorPicker` (PnP) | Fundo da área de leitura, atrás do livro. |
| Mostrar miniaturas | Toggle | Exibe/oculta o botão e o painel de miniaturas. |
| Mostrar zoom | Toggle | Exibe/oculta os controles de zoom na Toolbar (e desabilita os atalhos de teclado `+`/`-`). |
| Mostrar tela cheia | Toggle | Exibe/oculta o botão de tela cheia (e desabilita o atalho `F`). |
| Mostrar contador de páginas | Toggle | Exibe/oculta o texto "Página X de Y". |
| Abrir na capa | Toggle | Mapeia para `showCover` do `page-flip` — primeira página isolada. |
| Abrir em páginas duplas | Toggle | Mapeia para `!usePortrait` do `page-flip` — miolo do livro em spread duplo mesmo em telas menores (dentro dos limites de `minWidth`). |

---

## 6. Requisitos de ambiente

- **Node.js**: `v22.x` (LTS) — obrigatório para SPFx `1.21.1`.
- **SharePoint Online** (tenant com permissão para adicionar soluções/apps).
- Permissão de leitura do usuário final na biblioteca onde o PDF está
  armazenado (o Web Part usa o contexto autenticado do próprio usuário —
  nenhuma credencial de serviço é necessária ou embutida no código).

---

## 7. Comandos

```bash
# instalar dependências
npm install

# rodar localmente contra o workbench do seu tenant (gulp serve)
npm run serve
# equivalente a: gulp serve --nobrowser

# lint
npm run lint
npm run lint:fix

# build de desenvolvimento
gulp bundle

# build de produção (minificado)
gulp bundle --ship

# gerar o pacote de solução (.sppkg) em modo produção
gulp package-solution --ship

# atalho: limpa, builda em modo ship e empacota
npm run deploy-package
```

O arquivo `.sppkg` final é gerado em:

```
sharepoint/solution/pdf-flipbook.sppkg
```

> Este projeto foi validado de ponta a ponta neste ambiente: `npm install`,
> `gulp bundle`, `gulp bundle --ship` e `gulp package-solution --ship`
> executam sem erros e produzem um `.sppkg` válido.

---

## 8. Implantação em produção

1. `npm install`
2. `gulp bundle --ship`
3. `gulp package-solution --ship`
4. Faça upload de `sharepoint/solution/pdf-flipbook.sppkg` no **App Catalog**
   do tenant (ou do site, se for uma solução de site).
5. Adicione o Web Part **Flipbook PDF Viewer** a uma página moderna.
6. No Property Pane, selecione o PDF na biblioteca de documentos e ajuste
   cores/recursos conforme a identidade visual desejada.

> O `package-solution.json` está configurado com `"skipFeatureDeployment":
> true` e `"isDomainIsolated": false`, adequados para a maioria dos tenants
> corporativos. Ajuste conforme a política de governança da sua organização.

---

## 9. Limitações conhecidas e próximos passos

- O `page-flip` aplica zoom via CSS `transform` sobre o contêiner; em
  níveis altos de zoom, o gesto de "virar página" por clique pode ficar
  menos preciso nas bordas — mitigado priorizando o painel de miniaturas
  para navegação direta quando ampliado.
- PDFs muito grandes (dezenas de milhares de páginas) ainda criam um array
  de referências de imagem do tamanho total do documento (a maioria como
  placeholder); isso é leve em memória, mas, para catálogos extremamente
  grandes, uma futura evolução seria paginar também esse array.
- Este projeto não foi testado manualmente em um tenant real do SharePoint
  Online (ambiente de execução sem acesso a um tenant/PDF de teste); toda a
  validação foi feita via build/lint/typecheck completos do toolchain SPFx.
  Recomenda-se um teste manual em um site de teste antes do rollout amplo.
