# DECISIONS.md

Por qué se implementó cada cosa como se implementó. Sigue la numeración del CLAUDE.md (D1–D7) y después resuelve los "pendientes" de la sección 8.

---

## D1 — Votos vs. resultado en tesis

`lib/vote.ts` expone `toggleVote`, una función pura (votar de nuevo quita el voto, votar el opuesto lo cambia) que se usa en dos lugares: `lib/api.ts` (la "verdad" del mock) y `lib/queries.ts` (el optimistic update del cliente). Que ambos lados usen la misma lógica evita que la UI muestre algo que el "server" después va a corregir.

El freeze de una tesis cerrada se aplica en **dos capas**, no solo visualmente: `voteContent` en `lib/api.ts` rechaza el voto si `status === "CLOSED"` (para que no alcance con inspeccionar el DOM y togglear un botón deshabilitado), y `VoteControl` recibe `disabled` + `disabledReason="Votación cerrada"` que se muestra en un tooltip. `ConsensusVsOutcome` (`components/content/consensus-vs-outcome.tsx`) muestra consenso y resultado como dos filas siempre visibles en una tesis cerrada, y deriva el badge "Acertó/Falló contra el consenso" (`lib/consensus.ts`) únicamente cuando divergen — si coinciden no se agrega ruido.

## D2 — Vista de detalle

Cada pieza tiene su propia ruta (`/posts/[id]`, `/theses/[id]`). La restauración de scroll se apoya en el comportamiento nativo de Next.js App Router: `<Link>`/`router.back()` ya preservan la posición de scroll del feed al volver, siempre que la página vuelva a pintar desde caché sin flash de carga — por eso el `QueryClient` es un singleton estable (`app/providers.tsx`) y las queries del feed no se invalidan agresivamente. Se verificó manualmente con Playwright: scrollear el feed → entrar a una tesis → volver → la posición se preserva exactamente.

El único matiz es `BackLink` (`components/back-link.tsx`): `router.back()` solo funciona si hay historial propio de la sesión. Si alguien entra directo por URL a `/assets/nvda/theses/t1` no hay adónde "volver". Por eso cada card marca `sessionStorage["asinko:cameFromFeed"]` antes de navegar (`lib/scroll-restoration.ts`), y `BackLink` decide en base a eso: `router.back()` si vino del feed, un `<Link>` plano a `/assets/[ticker]` si no.

**Desktop: una columna centrada de lectura, no dos columnas.** El CLAUDE.md dejaba ambas opciones abiertas. Con un solo comentario largo o un reasoning extenso, dos columnas angostas se sienten más recortadas que una columna de ~65ch bien espaciada; el patrón editorial (texto largo, ancho de lectura cómodo) pesó más que aprovechar el ancho por aprovecharlo.

Mobile: barra sticky abajo (`components/detail/mobile-action-bar.tsx`) con voto + acceso a comentar, `padding-bottom: env(safe-area-inset-bottom)` para los dispositivos con home indicator, y `pb-20` en el body para que el contenido no quede tapado.

## D3 — Comentarios

Los 25 comentarios de relleno se agregaron respetando el split exacto pedido (P1+2 · P2+5 · P3+1 · T1+10 · T2+7) en `lib/mock-data.ts`, con votos deliberadamente más bajos que los 2 comentarios semilla de cada pieza — así el preview de la card (`getCommentPreview` en `lib/api.ts`) puede tomar **siempre los primeros dos por orden de inserción** en vez de ordenar por voto. Esto es a propósito: si el preview dependiera del sort por voto, alcanzaría con que un comentario de relleno tuviera más upvotes que uno del seed para que la card mostrara un par distinto al que pide la consigna. Insertar el par semilla primero y tomar `slice(0, 2)` lo hace inmune a eso.

El detalle sí pagina por voto/fecha real vía `useCommentsInfiniteQuery` (TanStack `useInfiniteQuery`, 5 por página). El toggle de sort (`Más votados · Recientes`, default Más votados) es dos botones simples, no un componente de terceros, para no arrastrar una dependencia de Select por dos opciones.

El comentario nuevo se optimistic-inserta **arriba de la página visible actual**, independientemente del sort activo — es una concesión de UX (el usuario espera ver lo que acaba de escribir) sobre la pureza del orden "más votados" (que ubicaría un comentario con 0 votos al final). Se reconcilia solo en el próximo `invalidateQueries`.

En T2 (cerrada), los comentarios de relleno mezclan fechas anteriores y posteriores al cierre (2026-06-30): antes del cierre discuten la tesis en curso, después reconocen el resultado — reforzando la idea central del producto (los votos midieron expectativa, no certeza).

## D4 — Estructura de la página del activo

Posteos arriba, tesis abajo, orden exacto según lo pedido (`lib/api.ts#getAssetContent` ordena de una vez server-side). El sidebar (`ThesisTracker`) es sticky solo en desktop y no duplica las cards: una línea compacta con el dato que la card no muestra al toque (distancia al target + días restantes en abiertas; consenso + mismatch en cerradas). En mobile, `ThesisStrip` reemplaza el sidebar con una franja calculada dinámicamente ("2 tesis · 1 abierta · 1 acertada") que hace `scrollIntoView` a la sección de tesis — generaliza a N tesis con cualquier combinación de abiertas/acertadas/incorrectas, no son strings hardcodeados del seed.

## D5 — Cards

El patrón **stretched link** (`PostCard`, `ThesisCard`) se apoya en el orden de pintado de CSS: el `<Link>` de toda la card es `position: absolute; inset: 0` con z-index automático (categoría 6 del stacking order), lo que lo pinta *encima* del contenido estático normal (categoría 3) — headline, cuerpo, preview de comentarios — sin taparlo visualmente (es transparente) pero sí capturando el click. El footer de votos/comentarios usa `position: relative; z-index: 10` para ganarle a ese link. Nunca hay un `<button>` anidado dentro de un `<a>`.

La celda contextual de `ThesisDataGrid` reemplaza "Activo $NVDA" (redundante en esta página) por precio actual + distancia al target (abierta) o precio de cierre (cerrada), tal como pedía la consigna; el campo `asset` se mantiene en el modelo (`lib/types.ts`) por si en el futuro se necesita fuera de esta página.

## D6 — Puntaje

`formatScore` (`lib/format.ts`) devuelve el signo real `−` (U+2212, no un guion) y `"0"` sin signo cuando el neto es cero. El score y los contadores de voto usan `font-mono tabular-nums` para que nada se mueva de ancho al votar. El `aria-label` del grupo de voto (`voteAriaLabel`) es una sola frase ("96 votos a favor, 145 en contra, puntaje −49") en el contenedor; los botones individuales llevan su propio `aria-label` ("Votar a favor"/"Votar en contra") separado, así un lector de pantalla no lee números sueltos sin contexto.

## D7 — Divisas

La divisa vive **solo** en `?currency=` (`lib/use-currency.ts`), nunca en un store de cliente. Deliberadamente **no** forma parte de ninguna query key de TanStack Query — cambiar de USD a EUR no dispara ningún refetch, solo cambia qué `Intl.NumberFormat` se usa para pintar el mismo dato ya en caché. El claim, el target y la resolución de una tesis siempre se formatean en `formatCurrency(x, "USD")`; la conversión aparece únicamente como línea secundaria ("≈ €230") en `ThesisDataGrid`.

El shell de formato usa siempre locale `en-US` (símbolo antes del número, separador de miles con coma) independientemente de la divisa — así el server y el cliente siempre renderizan el mismo string y no hay flash de hidratación por locale del navegador. El *default* de divisa sí usa el locale del navegador (`Intl.Locale(navigator.language).region` contra un mapa de regiones comunes → divisa) pero solo para decidir el valor inicial del selector, seteado una vez al montar.

---

## Pendientes resueltos

**Fechas.** Relativas en cards (`hace 3h`, `hace 2 días`) con `title` con la fecha completa para hover/long-press. Deadlines siempre absolutos y compactos (`15 mar 2027`) + días restantes en tesis abiertas. Todo calculado contra `MOCK_NOW = 2026-09-10` (`lib/format.ts`), nunca contra la fecha real del dispositivo — incluso los comentarios nuevos que se agregan en la sesión toman `MOCK_NOW` como `createdAt`, si no un comentario "nuevo" podría aparecer fechado después del resto del seed de forma inconsistente.

**Estados de carga.** Skeletons con la forma real del contenido (`CardSkeleton`, `DetailSkeleton`, `CommentItemSkeleton`), nunca spinners. "Ver más comentarios" muestra "Cargando…" en el propio botón en vez de un skeleton nuevo, porque ya hay contenido debajo esperando.

**Estados vacíos.** Comentarios: "Todavía no hay comentarios. Sé el primero." Ruta con id/ticker inexistente: `NotFoundPanel` con mensaje + `BackLink` a NVDA (no se usa `notFound()` de Next.js porque estas páginas son Client Components que resuelven el dato vía TanStack Query después del mount — `notFound()` está documentado para Server Components/Route Handlers, no para ese caso). Tesis filtradas sin resultados: mensaje contextual ("No hay tesis cerradas para este activo").

**Sistema visual.** Se evitó el look genérico de dashboard shadcn manteniendo la paleta neutra que pide la consigna (el color se reserva para voto activo y resultado de tesis) pero construyendo identidad vía **tipografía**, no color: los posteos (opinión casual) usan la sans por defecto; el *claim* de una tesis (predicción formal, verificable) usa una serif editorial (`Source Serif 4`) que la hace leer como un titular, no como un post más. Todo dato financiero — ticker, precios, scores, fechas de la grilla — usa monoespaciada (`Geist Mono`), separando visualmente "dato" de "prosea". Motion: feedback de presión (`scale(0.97)`, solo `transform`, curva `cubic-bezier(0.23,1,0.32,1)`, <300ms) en botones y controles de voto; entrada escalonada (stagger, 60ms entre cards) al montar el feed la primera vez; todo respeta `prefers-reduced-motion`.

**Mobile/táctil.** Objetivos de 44×44px en todos los controles interactivos (incluidos los de voto dentro de las cards), `env(safe-area-inset-bottom)` en la barra sticky, y el gesto de back nativo del navegador funciona porque el detalle usa `router.back()` real (no una navegación simulada) cuando corresponde.

---

## Verificación manual hecha

Se corrió la app con Playwright contra `npm run dev` (sin errores de consola) cubriendo: feed → detalle → volver con scroll preservado; voto optimista en card y en detalle; tesis cerrada con botones deshabilitados + tooltip; bloque consenso-vs-resultado; cambio de divisa sin refetch visible; paginación/orden de comentarios; barra sticky y franja de tesis en viewport mobile (375px); ruta con id inexistente.
