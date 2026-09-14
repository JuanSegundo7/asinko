const DETAIL_ROUTE = /^\/assets\/[^/]+\/(posts|theses)\/[^/]+$/

/** D2/D4: una ruta de detalle (posteo o tesis) se trata como pantalla completa por debajo de xl (1280px) — se usa para ocultar el header/strip del activo y la tab bar mientras el detalle (panel interceptado o página directa) ocupa toda la pantalla. */
export function isDetailRoute(pathname: string): boolean {
  return DETAIL_ROUTE.test(pathname)
}
