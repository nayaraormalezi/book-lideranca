# Leitor de PDF Flipbook para SharePoint Online

Web Part de produção para leitura de PDFs armazenados em bibliotecas do
SharePoint. A solução usa SPFx 1.23.2, React 17, TypeScript, PDF.js, StPageFlip e
Fluent UI, sem jQuery.

## Decisões técnicas

- **SPFx 1.23.2 e Node 22:** versões estáveis recomendadas pela Microsoft.
- **Heft:** toolchain oficial de novos projetos SPFx desde a versão 1.22.
- **PDF.js 6:** processa o PDF no navegador e mantém o arquivo protegido pelas
  permissões do SharePoint.
- **StPageFlip sem wrapper React:** o pacote `page-flip` tem API pequena e MIT.
  A integração imperativa fica isolada no componente `Flipbook`; o restante da
  aplicação e todo o ciclo de vida continuam em React.
- **Alternativas avaliadas:** soluções WebGL recentes têm pouca adoção e bundle
  maior; `flipbook-engine` exige AGPL ou licença comercial. StPageFlip continua
  sendo a escolha de menor risco para este caso corporativo.
- **Renderização virtualizada:** todas as folhas existem como elementos leves
  para o motor de paginação, mas apenas a página atual e sua janela adjacente
  possuem canvas PDF renderizado. Canvases distantes são liberados. Miniaturas
  usam `IntersectionObserver`.
- **SOLID e injeção de dependências:** acesso ao SharePoint e PDF.js ficam atrás
  de interfaces e são injetados pelo Web Part.

## Arquitetura

```text
src/webparts/flipbook/
├── components/
│   ├── Flipbook/
│   ├── Toolbar/
│   ├── ThumbnailPanel/
│   ├── Loading/
│   └── Error/
├── hooks/usePdf.ts
├── services/
│   ├── PdfService.ts
│   └── SharePointService.ts
├── models/index.ts
└── FlipbookWebPart.ts
```

O `SharePointService` usa `SPHttpClient`, portanto a autenticação, autorização e
cookies são os da sessão atual. URLs absolutas e relativas ao servidor são
aceitas. Respostas 401/403, 404, indisponibilidade e arquivos inválidos têm
mensagens distintas.

## Pré-requisitos

- Node.js `>=22.14 <23`
- npm 10+
- Tenant SharePoint Online com App Catalog
- Permissão de leitura do usuário sobre o PDF

## Instalação

```bash
cd book-lideranca
npm install
npm run start
```

Abra o workbench hospedado do tenant e adicione o Web Part **Leitor de PDF**.
No painel de propriedades, informe a URL do PDF e configure cores, miniaturas,
zoom, tela cheia, contador e modo inicial.

## Build e pacote

```bash
# validação, bundle de produção e geração do .sppkg
npm run build

# comandos explícitos equivalentes
npm run bundle
npm run package-solution
```

O pacote é gerado em:

```text
sharepoint/solution/book-lideranca.sppkg
```

Faça upload no App Catalog, confirme a implantação e adicione o aplicativo ao
site se a implantação global não tiver sido escolhida.

### Sobre os comandos Gulp solicitados

`gulp serve`, `gulp bundle --ship` e `gulp package-solution --ship` pertencem ao
toolchain legado do SPFx 1.21.1 e anteriores. Eles não existem em um novo projeto
SPFx 1.23.2. Os equivalentes suportados são:

| Legado | SPFx 1.23.2 |
|---|---|
| `gulp serve` | `npm run serve` |
| `gulp bundle --ship` | `npm run bundle` |
| `gulp package-solution --ship` | `npm run package-solution` |

## Configurações

- URL do PDF
- Cor principal, toolbar e fundo (`#RRGGBB`)
- Mostrar/ocultar miniaturas
- Mostrar/ocultar zoom
- Mostrar/ocultar tela cheia
- Mostrar/ocultar contador
- Abrir na capa
- Forçar abertura em páginas duplas

## Operação e segurança

- Nenhuma permissão API adicional é solicitada no manifesto.
- O Web Part não contorna permissões do SharePoint.
- O arquivo é carregado em memória e não é persistido em armazenamento local.
- O PDF.js executa o processamento em Web Worker empacotado com a solução.
- Para PDFs muito grandes, o arquivo ainda precisa ser transferido por completo;
  a renderização visual, porém, permanece sob demanda.

## Licenças das bibliotecas

- PDF.js: Apache-2.0
- StPageFlip (`page-flip`): MIT
- Fluent UI React: MIT
