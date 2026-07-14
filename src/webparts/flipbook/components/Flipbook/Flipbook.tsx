import * as React from 'react';
import { PageFlip } from 'page-flip';
import { FLIPBOOK_CONSTANTS } from '../../utils/constants';
import { IFlipbookHandle, IFlipbookProps } from './IFlipbookProps';
import styles from './Flipbook.module.scss';

/**
 * Placeholder leve (SVG inline) usado para páginas ainda não rasterizadas pelo PDF.js.
 * O `page-flip` precisa de um array de imagens com o tamanho total do livro para
 * conhecer a contagem de páginas e permitir "adiantar" o flip visualmente; páginas fora
 * da janela de renderização (ver `FLIPBOOK_CONSTANTS.RENDER_WINDOW_RADIUS`) recebem este
 * placeholder em vez de disparar a rasterização cara do PDF — é assim que o componente
 * atende ao requisito de "renderizar somente as páginas necessárias".
 */
const PLACEHOLDER_PAGE_IMAGE =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="848" viewBox="0 0 600 848">' +
      '<rect width="600" height="848" fill="#f3f2f1"/></svg>'
  );

/**
 * Núcleo visual do leitor: integra o PDF.js (via páginas já rasterizadas em `props.pages`)
 * com o motor de flip `page-flip`. Não conhece SharePoint nem Property Pane — recebe tudo
 * já resolvido via props, o que o torna testável isoladamente e reutilizável fora do
 * contexto de um Web Part, se necessário.
 */
export const Flipbook = React.forwardRef<IFlipbookHandle, IFlipbookProps>((props, ref) => {
  const { documentInfo, pages, onRequestPage, onPageChange, theme, features, device, zoomScale } = props;
  const numPages = documentInfo.numPages;

  const hostRef = React.useRef<HTMLDivElement>(null);
  const pageFlipRef = React.useRef<PageFlip | undefined>(undefined);

  const images = React.useMemo(() => {
    const list: string[] = [];
    for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
      const rendered = pages[pageNumber];
      list.push(rendered?.status === 'rendered' && rendered.dataUrl ? rendered.dataUrl : PLACEHOLDER_PAGE_IMAGE);
    }
    return list;
  }, [pages, numPages]);

  const requestRenderWindow = React.useCallback(
    (centerPageNumber: number) => {
      const radius = FLIPBOOK_CONSTANTS.RENDER_WINDOW_RADIUS;
      const start = Math.max(1, centerPageNumber - radius);
      const end = Math.min(numPages, centerPageNumber + radius);
      for (let pageNumber = start; pageNumber <= end; pageNumber++) {
        onRequestPage(pageNumber, FLIPBOOK_CONSTANTS.PAGE_RENDER_TARGET_WIDTH);
      }
    },
    [numPages, onRequestPage]
  );

  // (Re)cria a instância do page-flip quando o documento muda, quando a "família" de
  // dispositivo muda (mobile/tablet/desktop) ou quando capa/página-dupla são alternados
  // no Property Pane — todas essas mudanças afetam parâmetros que o page-flip só lê na
  // inicialização (não são reativos internamente).
  React.useEffect(() => {
    const host = hostRef.current;
    if (!host || numPages === 0) {
      return undefined;
    }

    const aspectRatio = documentInfo.firstPageSize.width / documentInfo.firstPageSize.height;
    const baseWidth = 600;
    const baseHeight = Math.round(baseWidth / aspectRatio);

    const pageFlip = new PageFlip(host, {
      width: baseWidth,
      height: baseHeight,
      size: 'stretch',
      minWidth: 220,
      maxWidth: 1400,
      minHeight: 300,
      maxHeight: 2000,
      showCover: features.openOnCover,
      usePortrait: !features.doublePageMode,
      mobileScrollSupport: false,
      useMouseEvents: true,
      showPageCorners: true,
      disableFlipByClick: false,
      drawShadow: true,
      flippingTime: 700,
      maxShadowOpacity: 0.5
    });

    pageFlip.loadFromImages(images);
    pageFlipRef.current = pageFlip;

    pageFlip.on('flip', (event) => {
      const pageIndex = Number(event.data);
      const pageNumber = pageIndex + 1;
      onPageChange(pageNumber);
      requestRenderWindow(pageNumber);
    });

    onPageChange(1);
    requestRenderWindow(1);

    return () => {
      pageFlip.destroy();
      pageFlipRef.current = undefined;
    };
    // `images` intencionalmente fora das deps: a inicialização usa o snapshot atual e as
    // atualizações seguintes são feitas via `updateFromImages` no efeito abaixo, sem recriar o livro.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentInfo, numPages, features.openOnCover, features.doublePageMode, device]);

  // Atualiza somente as imagens (sem recriar o livro/perder a página atual) conforme o
  // PDF.js termina de rasterizar páginas dentro da janela de renderização.
  React.useEffect(() => {
    if (pageFlipRef.current) {
      pageFlipRef.current.updateFromImages(images);
    }
  }, [images]);

  React.useImperativeHandle(
    ref,
    (): IFlipbookHandle => ({
      flipNext: () => pageFlipRef.current?.flipNext(),
      flipPrev: () => pageFlipRef.current?.flipPrev(),
      flipToFirst: () => pageFlipRef.current?.flip(0),
      flipToLast: () => pageFlipRef.current?.flip(Math.max(0, numPages - 1)),
      flipToPage: (pageNumber: number) =>
        pageFlipRef.current?.flip(Math.max(0, Math.min(numPages - 1, pageNumber - 1)))
    }),
    [numPages]
  );

  return (
    <div className={styles.stage} style={{ backgroundColor: theme.backgroundColor }}>
      <div className={styles.zoomWrapper} style={{ transform: `scale(${zoomScale})` }}>
        <div className={styles.bookHost} ref={hostRef} />
      </div>
    </div>
  );
});

Flipbook.displayName = 'Flipbook';
