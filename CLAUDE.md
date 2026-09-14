# Asinko — Página de detalle de activo (prueba técnica)

Este archivo es el contexto del proyecto para agentes (Claude Code, agente de diseño). Leelo completo antes de proponer o escribir código. Las decisiones marcadas como **cerradas** no se reabren sin consultar.

---

## 1. Qué es el proyecto

Asinko es una red social donde la comunidad publica y discute research sobre activos financieros. Hay que construir un **mockup funcional** de la página de un activo (NVDA), sin backend real.

En la página conviven dos tipos de contenido:

- **Posteo**: contenido corto tipo red social (opinión, noticia comentada, dato suelto).
- **Tesis**: predicción puntual y **verificable**, con estructura fija: activo, claim con fecha, precio objetivo, deadline (fecha puntual), convicción (Baja / Media / Alta / Extrema) y razonamiento. En algún momento se sabe si fue correcta o no.

Ambos se pueden votar (upvote / downvote) y comentar.

### Requisitos de la consigna

1. **Página del activo**: encabezado (nombre, ticker y datos relevantes), sección con los 3 posteos, sección con las 2 tesis.
2. **Vista de detalle**: al hacer click en cualquier posteo o tesis se ve el contenido completo, upvotes/downvotes y comentarios.
3. **DECISIONS.md**: la consigna deja huecos a propósito (orden, comentarios que exceden lo mostrado, puntaje negativo, mobile, etc.). Se evalúa tanto el resultado como el razonamiento.

### Idea central del producto (guía todas las decisiones)

> No es una red social sobre finanzas. Es una red social donde las opiniones eventualmente quedan contrastadas con la realidad.

El seed lo demuestra: la tesis de @shortandlong fue votada en contra (96 ▲ / 145 ▼) y **acertó**. Los votos miden lo que la comunidad creía; el resultado mide lo que pasó. La UI tiene que dejar eso claro.

### Prioridades

1. **UX/UI**: súper intuitivo, pocos pasos, fácil de usar.
2. **Mobile first**.
3. Flujo click → detalle → volver impecable.
4. Look de **dashboard financiero, modo oscuro**, con acabado pulido.
5. **No inventar datos sin base** — todo lo que se muestre tiene que derivarse del seed o ser un mock explícito, documentado como tal (ver D9 en DECISIONS.md). Sin imágenes de stock inventadas por el agente ni "rendimiento de la comunidad" (ninguna base posible de la que derivarlo). Excepciones justificadas: precio actual mock, tipos de cambio mock, comentarios faltantes (sección 5), y — sumados tras feedback visual del usuario, cada uno con su propia adaptación honesta — serie de precio mock (ancla en puntos reales del seed, D9), market cap (derivado de precio × acciones, no un campo suelto), volumen 24h y ATH mock (ATH derivado de la propia serie), consenso de la comunidad (2 baldes reales, no 3 inventados), ranking de contribuidores (por score agregado real, no por % de acierto inventado — el seed no tiene suficientes tesis cerradas para eso), y **D13**: avatares reales de los 8 usuarios del seed + logo del activo, provistos directamente por el usuario en `public/` (no son imágenes de stock inventadas — la regla apuntaba a eso, no a bloquear assets que el propio usuario aporta).
6. Contexto **global**, no enfocado en ningún país.

---

## 2. Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind** + **shadcn/ui**
- **TanStack Query** sobre una capa de API mock
- **Lucide** para íconos
- Fuentes con `next/font`
- Sin base de datos ni backend real

### Capa de datos

- `lib/api.ts`: funciones async que devuelven el mock con un delay chico (~300–600 ms). Es la única pieza a reemplazar si hubiera backend.
- TanStack Query encima para: votos y comentarios con **optimistic updates + rollback**, estados de carga reales (skeletons), paginación de comentarios y carga de tipos de cambio.
- Card, panel y página de detalle leen del **mismo caché**: si votás en el feed, el voto ya está reflejado en el detalle.
- Estado de cliente mínimo: la divisa va en search param (`?currency=EUR`), no en un store.
- Fechas relativas calculadas contra un `MOCK_NOW` fijo (`2026-09-10T12:00:00Z`) y **siempre en UTC** (evita errores de un día por zona horaria: T1 debe dar 186 días, no 187).
- Usuario actual mock: `@demo` (autor de los comentarios nuevos y dueño de `userVote`).

---

## 3. Decisiones cerradas

### D1 — Votos vs. resultado en tesis

- En tesis **abierta**, votar = "¿creés que va a pasar?". En posteo = "¿aporta?".
- Al **cerrarse** una tesis, los votos se **congelan**: el conteo final es el registro histórico de lo que creía la comunidad. Botones deshabilitados con label/tooltip "Votación cerrada", en card y detalle.
- En la tesis cerrada se muestran las dos dimensiones: **consenso** (a favor / en contra según el score) y **resultado** (acertada / incorrecta, precio y fecha de resolución).
- Si consenso y resultado no coinciden, badge derivado: **"Acertó contra el consenso"** (o "Falló pese al consenso").

### D2 — Vista de detalle (revisada): panel lateral que también es ruta

Se implementa con **parallel + intercepting routes** de Next:

- **Desktop (≥1024 px)**: click en una card → la URL cambia a `/assets/nvda/theses/t2` y el detalle se abre en un **panel a la derecha**. El panel **reemplaza la columna derecha** (tracker/resumen), no se superpone al feed: el feed queda completo, visible y clickeable. Click en otra card → el panel cambia de contenido sin cerrarse. Botón atrás del navegador, `Esc` o "✕" lo cierran.
- **Mobile / tablet**: la misma ruta se abre **a pantalla completa**, con "← NVDA" arriba y **barra sticky abajo** con votos + input de comentario (al alcance del pulgar, respetando safe areas). La tab bar se oculta dentro del detalle.
- **Entrada directa por link** (refresh o URL compartida): se renderiza la **página completa** de detalle.
- Se preservan: URL propia, back nativo, link compartible, historial. El scroll del feed se mantiene porque nunca se abandona la página.
- Estructura de contenido del detalle (igual en panel y página): badges (tipo + estado) → autor y tiempo → claim/texto → grilla de datos (tesis) → razonamiento → bloque consenso vs. resultado (tesis cerrada) → votos + score → comentarios (sort + input + lista + "Ver más").

Implementación:

```
app/assets/[ticker]/
  layout.tsx              // recibe children + @panel
  page.tsx                // feed
  @panel/default.tsx      // null → muestra la columna derecha normal
  @panel/(.)posts/[id]/page.tsx
  @panel/(.)theses/[id]/page.tsx
  posts/[id]/page.tsx     // página completa (entrada directa / mobile)
  theses/[id]/page.tsx
  theses/page.tsx         // todas las tesis
```

En mobile, el panel interceptado se renderiza como vista a pantalla completa (mismo componente `ContentDetail`, distinto contenedor).

### D3 — Comentarios

- El seed trae 2 comentarios por pieza pero los contadores dicen más. **Se completa el mock** para que los números coincidan (sección 5).
- **Card**: 2 comentarios de preview (como en el seed).
- **Detalle**: primeros 5 + botón "Ver N comentarios más" que carga el resto con TanStack Query (skeleton breve).
- Orden: toggle simple de dos opciones **"Más votados · Recientes"** (default: más votados). Por eso los comentarios tienen votos.
- Input para escribir comentario; el nuevo aparece arriba (optimistic), autor `@demo`.

### D4 — Distribución de la página (revisada)

```
DESKTOP (≥1280 px)
┌──────────────────────────────────────────────────────────────────┐
│ ASINKO                                                        🔔 │
├────────┬───────────────────────────────────────────────────────┤
│ Inicio │ ┌─ NVDA  NVIDIA Corp. · Semiconductores    [USD ▾] ──┐ │
│ Explor.│ │ $185.20 +0.30% (24h)      Market Cap  Vol 24h  ATH │ │
│▸Activos│ │                            $4.5T      $28.4B  ...  │ │
│ Activ. │ │                                    [gráfico precio]│ │
│        │ └─────────────────────────────────────────────────────┘ │
│ FAVOR. ├────────────────────────────────┬─────────────────────┤
│ ▸ NVDA │ POSTEOS (3)                    │ ┌─ Consenso ──────┐ │
│        │ [post card]                    │ │ 74% a favor     │ │
│        │ [post card]                    │ └─────────────────┘ │
│        │ [post card]                    │ ┌─ Contribuidores ┐ │
│        │                                │ │ ranking x score │ │
│        │ TESIS (2)                      │ └─────────────────┘ │
│        │ [tesis card]                   │ ┌─ Tesis (2) ─────┐ │
│        │ [tesis card]                   │ │ ...   Ver todas→│ │
│        │                                │ └─────────────────┘ │
│ @demo  │                                │ ┌─ Actividad ─────┐ │
│        │                                │ │ 5 · 35 · 1      │ │
│        │                                │ └─────────────────┘ │
└────────┴────────────────────────────────┴─────────────────────┘
          (al abrir un detalle, un drawer flota desde la derecha por
          encima de todo esto — el feed y la columna derecha quedan
          intactos detrás, visibles donde el drawer no los tapa; ver D2)
```

- **Header de página** (franja superior, ancho completo, por encima de todo): logo Asinko + campana de notificaciones deshabilitada (`aria-disabled` + tooltip "Fuera del alcance del mockup", mismo patrón que el nav). Sin buscador (sería funcionalidad falsa).
- **Nav lateral izquierda** (look de app/dashboard), debajo del header:
  - Items: Inicio, Explorar, **Activos** (activo), Mi actividad. **Solo "Activos" funciona**; el resto se muestra deshabilitado (`aria-disabled`, opacidad reducida) con tooltip "Fuera del alcance del mockup". Nunca links muertos que no hacen nada.
  - Favoritos: solo **NVDA** (es el único activo del seed).
  - Abajo: usuario actual `@demo`.
- **Header del activo** (card flotante, elevada, no una franja pegada al fondo): ticker, nombre (serif), sector, precio en **USD** como principal y conversión como secundaria, selector de divisa, variación diaria, Market Cap/Volumen 24h/ATH y gráfico de precio con selector de rango (7D/1M/3M/1A/Todo) — todo mock derivado de una serie de precio determinística, ver D9 en DECISIONS.md.
- **Feed**: posteos arriba (lectura rápida, puerta de entrada), tesis abajo. Posteos por recencia; tesis abiertas antes que cerradas, luego por recencia.
- **Columna derecha** (sticky), cada widget en su propia card, todo **derivado del seed**: consenso de la comunidad (2 baldes reales, a favor/en contra) y contribuidores destacados (ranking por score agregado) arriba, después:
  - **Tracker de tesis**: una línea compacta por tesis con el dato que la card no muestra a simple vista (abierta: distancia al target y días restantes; cerrada: "Acertó contra el consenso · ▲96 ▼145"). Cada ítem abre el detalle. "Ver todas →" a `/assets/nvda/theses` (filtro Abiertas · Cerradas).
  - **Actividad**: "5 publicaciones · 35 comentarios · 1 tesis acertada contra el consenso".
- **Breakpoints**:
  - `<768` (mobile): sin nav lateral → **tab bar inferior** (4 íconos, mismo criterio de deshabilitados). Sin columna derecha → franja compacta bajo el header: "2 tesis · 1 abierta · 1 acertada" que hace scroll a la sección de tesis. Detalle a pantalla completa.
  - `768–1279` (tablet): nav lateral colapsada a íconos; columna derecha oculta (misma franja que mobile); detalle a pantalla completa.
  - `≥1280` (desktop): layout de tres columnas completo con panel.

### D5 — Cards

**Card de tesis** lleva toda la data del seed: tipo, estado, tiempo de publicación, claim, autor, grilla de datos, razonamiento completo (sin truncar), votos + score, contador de comentarios, 2 comentarios de preview.

- Grilla de 4 celdas **contextual**: la celda "Activo $NVDA" es redundante dentro de la página de NVDA y se reemplaza por:
  - Abierta → "Precio actual $185.20 · faltan +35%"
  - Cerrada → "Cerró en $178.40"
  - El campo `asset` se mantiene en el modelo y se muestra solo fuera de la página del activo.
- Precio objetivo con **dirección**: ▲ superará / ▼ no superará.
- Convicción: indicador de **4 segmentos** + solo el valor ("Alta"), sin repetir "Convicción".

**Card de posteo**: autor, tiempo, texto completo, votos + score, contador, 2 comentarios de preview. Sin imágenes ni emojis.

**Votar desde la card**:

- Patrón **stretched link**: el claim/texto es el `<a>` real con pseudo-elemento que cubre la card; los botones quedan encima con `z-index`. Nunca `<button>` dentro de `<a>`.
- Área táctil mínima **44×44 px** por botón.
- Toggle: tocar de nuevo quita el voto; tocar el opuesto lo cambia. Feedback inmediato (optimistic).
- "N comentarios" abre el detalle con foco en el input de comentarios.

### D6 — Puntaje

- `score = upvotes − downvotes`, **al lado de los votos** en card y detalle:
  ```
  ▲ 312  ▼ 28   +284
  ▲ 96   ▼ 145  −49
  ```
- Score en **color neutro**, positivo o negativo. El color se reserva para "tu voto" activo. Un negativo no es un error: la tesis −49 acertó.
- Signo menos real `−` (U+2212). Score 0 → "0" sin signo.
- `tabular-nums` para que nada se mueva al votar.
- `aria-label`: "96 votos a favor, 145 en contra, puntaje −49".

### D7 — Divisas

- Divisas: **USD, EUR, GBP, JPY** (JPY a propósito: sin decimales).
- Formato con **`Intl.NumberFormat`**.
- Selector en un único lugar: header del activo, con `Select` de shadcn (no select nativo). Default según locale del navegador, persistido en la URL.
- **Todo precio se muestra en USD (moneda nativa) como principal y la divisa elegida como secundaria** ("$185.20 ≈ €170.38"). Aplica al header, a la grilla y al tracker. Con USD seleccionado, no se muestra secundario.
- El claim, el target y la resolución de una tesis **nunca** se convierten. Motivo: si el target se convirtiera, se movería con el tipo de cambio y la tesis podría parecer más cerca o lejos del objetivo sin que NVDA se mueva.
- Tipos de cambio mock (1 USD =): EUR 0.92 · GBP 0.79 · JPY 147. Cargados vía TanStack Query con delay.

### D8 — Sistema visual

**Modo oscuro** (único tema). Estética: dashboard financiero pulido, con toque editorial en los claims.

Paleta (tokens CSS / Tailwind) — **D12**: tomada de la paleta de la imagen de referencia del usuario (dashboard fintech estilo Bitcoin) — fondo navy oscuro y azul/verde/rojo saturados; reemplaza un intento previo con los colores de sistema de Apple (D11), más discretos. Los roles semánticos no cambiaron en ninguna iteración, solo el hex:

| Token | Valor | Uso |
|---|---|---|
| `bg` | `#0A0D14` | fondo de la app |
| `surface` | `#131722` | cards, nav, panel |
| `surface-2` | `#1A1F2B` | grilla de tesis, inputs, hover |
| `border` | `#232838` | bordes sutiles de cards |
| `text` | `#F5F6F8` | texto principal |
| `text-muted` | `#8B93A7` | metadata, comentarios de preview, labels |
| `accent` | `#4F7DFA` | fills: voto activo, badge Abierta, botón enviar |
| `accent-text` | `#7AA2FF` | links y texto en azul (contraste AA sobre oscuro) |
| `positive` | `#22C55E` | solo "Acertada" y upvote activo (y variación de precio positiva, D9) |
| `negative` | `#EF4444` | solo "Incorrecta" y downvote activo (y variación de precio negativa, D9) |

Reglas de color:

- Base neutra. **Un solo acento** (azul) para lo interactivo y el estado Abierta.
- Verde/rojo solo con significado (resultado de tesis, tu voto). **En tesis, ni score ni números de voto/consenso llevan color** — un negativo ahí no es un error (T2: −49 y acertó), colorearlo contradiría esa idea. Excepciones acotadas y explícitas: la variación de precio (gráfico + %, dominio de mercado distinto, ver D9) y **D14**: el score de posteos/comentarios sí se colorea por signo — ahí no hay un "resultado" con el que el color pueda contradecirse.
- Contraste mínimo WCAG AA en todo texto.

Tipografía — tres familias, **cada una con un rol fijo**:

- **Serif** (ej. Newsreader / Source Serif 4): claim de la tesis y nombre del activo. Es la "voz" de las predicciones.
- **Sans** (ej. Inter / Geist): todo el texto y la UI.
- **Mono** (ej. Geist Mono / JetBrains Mono): **solo números** (precios, votos, score, %, días). Regla: todo número va en mono, ningún texto va en mono. Las fechas van en sans con formato corto ("15 mar 2027").

Jerarquía dentro de la card:

- Contenido principal: tamaño y contraste completos.
- Comentarios de preview: bloque con sangría y **línea vertical a la izquierda**, texto más chico en `text-muted`. Sin líneas horizontales.
- **Una sola línea divisoria**: antes del footer de votos.
- Cards: `surface`, borde `border`, padding generoso (20–24 px), separación entre cards 12–16 px. **D10**: esquinas squircle reales (no `border-radius`, ver DECISIONS.md), radio 20 px (28 px en superficies grandes: card del activo, drawer) + sombra por capas (`--shadow-elevation-1/2/3`) que sube de nivel en `:hover`, en vez de solo un cambio de color de borde.

Tesis vs. posteo (diferencia visible de un vistazo):

- Tesis: claim en serif grande, grilla de datos en `surface-2` con celdas tipo chip, **borde superior de 2 px** según estado (azul abierta / verde acertada / rojo incorrecta).
- Posteo: más liviano, sin grilla ni borde de estado.

Componentes:

- **Votos**: control tipo pastilla segmentada (▲ | ▼), 44 px de alto, fondo visible en hover, estado activo con fill de color. Deshabilitado en tesis cerrada.
- **Badges de estado**: pill pequeña con fondo tintado del color semántico (Abierta azul, Acertada verde, Incorrecta rojo) + badge derivado "Acertó contra el consenso".
- **Panel de detalle**: `surface`, borde izquierdo, ancho ~440–480 px, animación de entrada corta (slide + fade, 150–200 ms, respetando `prefers-reduced-motion`).
- Foco visible en todo elemento interactivo (anillo `accent-text`).

---

## 4. Modelo de datos

```ts
type Currency = "USD" | "EUR" | "GBP" | "JPY"
type Conviction = "LOW" | "MEDIUM" | "HIGH" | "EXTREME"
type ThesisDirection = "ABOVE" | "BELOW"   // superará / no superará
type ThesisStatus = "OPEN" | "CLOSED"
type ThesisOutcome = "CORRECT" | "INCORRECT"
type UserVote = "UP" | "DOWN" | null

type User = { handle: string }

type Asset = {
  ticker: string          // "NVDA"
  name: string            // "NVIDIA Corp."
  sector: string          // "Semiconductores"
  currency: Currency      // moneda nativa: "USD"
  price: number           // mock
}

type Comment = {
  id: string
  author: User
  body: string
  createdAt: string
  upvotes: number
  downvotes: number
  userVote: UserVote
}

type BaseContent = {
  id: string
  assetTicker: string
  author: User
  createdAt: string       // ISO UTC, relativo a MOCK_NOW
  upvotes: number
  downvotes: number
  userVote: UserVote
  commentCount: number
}

type Post = BaseContent & {
  type: "POST"
  body: string
}

type Thesis = BaseContent & {
  type: "THESIS"
  claim: string
  direction: ThesisDirection
  targetPrice: number     // en moneda nativa del activo
  deadline: string        // fecha puntual ISO
  conviction: Conviction
  reasoning: string
  status: ThesisStatus
  outcome: ThesisOutcome | null
  resolvedAt: string | null
  resolutionPrice: number | null
}

type Content = Post | Thesis
```

Notas:

- `status` y `outcome` son dimensiones separadas (el seed dice "Cerrada · Acertada").
- Asimetría de resolución: una tesis `ABOVE` puede cerrarse como correcta antes del deadline si el precio toca el target; una `BELOW` solo puede cerrarse como correcta al llegar el deadline.
- Comentarios paginados vía `getComments(contentId, { offset, limit, sort })`.

---

## 5. Contenido semilla (copiar tal cual)

**Activo**: NVDA · NVIDIA Corp. · Semiconductores · precio mock $185.20 USD

### Posteos

**P1** — @martincode · hace 3h · ▲ 128 ▼ 12 · 4 comentarios
> La nueva arquitectura Blackwell ya está copando los pedidos de los hyperscalers. Microsoft y Meta confirmaron ampliación de pedidos para el próximo trimestre. El cuello de botella sigue siendo capacidad de empaquetado en TSMC, no demanda.

- @florv — ¿Alguna fuente de esos números o es lo que se comenta en el sector?
- @renelong — El cuello de botella en CoWoS viene desde 2023, no es nuevo.

**P2** — @valeinversora · hace 1 día · ▲ 74 ▼ 31 · 7 comentarios
> A 35x ganancias forward, el mercado ya está descontando varios años de crecimiento a tasas actuales. No digo que sea mala empresa, digo que el precio no deja mucho margen de error.

- @deep.value — Depende de qué crecimiento asumís para datacenter en 2026. Ahí está la discusión.
- @martincode — 35x forward con revenue creciendo 80% interanual no me parece caro.

**P3** — @shortandlong · hace 2 días · ▲ 45 ▼ 9 · 3 comentarios
> El CEO vendió otro tramo de acciones esta semana. Ya van varios insiders liquidando posiciones en los últimos meses. ¿Alguien más lo está siguiendo?

- @florv — La mayoría son ventas programadas (10b5-1), no es necesariamente una señal.
- @valeinversora — Programadas o no, el volumen viene subiendo trimestre a trimestre.

### Tesis

**T1** — @deep.value · hace 4 días · **Abierta** · ▲ 312 ▼ 28 · 12 comentarios
- Claim: **$NVDA superará los $250 antes del 15 de marzo de 2027**
- Dirección: ABOVE · Target: $250 · Deadline: 2027-03-15 · Convicción: Alta
- Razonamiento:
> El capex de los hyperscalers en infraestructura de IA sigue acelerando de cara a 2027, y NVIDIA mantiene share dominante en entrenamiento e inferencia. El ecosistema CUDA eleva el costo de cambiar de proveedor y sostiene el múltiplo actual.

- @shortandlong — El argumento de CUDA es el más sólido acá, más que el crecimiento de corto plazo.
- @renelong — ¿Qué pasa con esta tesis si un hyperscaler anuncia chip propio a gran escala?

**T2** — @shortandlong · hace 3 meses · **Cerrada · Acertada** · ▲ 96 ▼ 145 · 9 comentarios
- Claim: **$NVDA no superará los $200 antes del 30 de junio de 2026**
- Dirección: BELOW · Target: $200 · Deadline: 2026-06-30 · Convicción: Media
- Resolución (mock): cerró en $178.40 el 2026-06-30
- Razonamiento:
> Los chips propios de los hyperscalers vienen reemplazando una porción creciente de su demanda interna, y AMD cierra la brecha de performance más rápido de lo que descuenta el mercado. Es una tesis de compresión de márgenes, no de colapso.

- @deep.value — El custom silicon lleva años "por llegar" y la brecha de software sigue siendo enorme.
- @martincode — Coincido en la dirección, discrepo en el timing: pensé que esto se jugaba en 2027-2028.

### Comentarios a completar

Para que los contadores coincidan hay que generar: **P1 +2 · P2 +5 · P3 +1 · T1 +10 · T2 +7** (25 en total; 35 comentarios en total en la página).

Pautas: mismos usuarios del seed (@martincode, @valeinversora, @shortandlong, @deep.value, @florv, @renelong) + como mucho 2–3 nuevos; mismo tono (breve, técnico, español neutro); que discutan el argumento concreto de cada pieza; votos variados; fechas posteriores a la publicación de la pieza. En T2, algunos comentarios anteriores al cierre y alguno posterior reconociendo el resultado.

---

## 6. Rutas

```
/                               → redirect a /assets/nvda
/assets/[ticker]                → página del activo
/assets/[ticker]/posts/[id]     → detalle de posteo (panel en desktop si se navega desde el feed)
/assets/[ticker]/theses/[id]    → detalle de tesis (ídem)
/assets/[ticker]/theses         → todas las tesis (filtro Abiertas · Cerradas)
```

## 7. Estructura sugerida

```
app/
  assets/[ticker]/   (ver D2 para parallel/intercepting routes)
components/
  shell/      AppNav (lateral), TabBar (mobile), NavItem
  asset/      AssetHeader, CurrencySelector, ThesisTracker, ActivitySummary, ThesisStrip (mobile)
  content/    PostCard, ThesisCard, ThesisDataGrid, ConvictionMeter,
              ThesisStatusBadge, ConsensusVsOutcome, VoteControl, Score,
              ContentDetail, DetailPanel, DetailSheet (mobile)
  comments/   CommentList, CommentItem, CommentPreview, CommentInput, CommentSort
  ui/         (shadcn)
lib/
  types.ts
  mock-data.ts
  api.ts          // funciones async con delay
  queries.ts      // hooks de TanStack Query
  format.ts       // Intl.NumberFormat, fechas UTC vs MOCK_NOW, signo −
```

---

## 8. Bugs conocidos de la versión actual (corregir primero)

- [x] Header muestra el precio en la divisa elegida como principal (€170.38) mientras la grilla muestra $185.20 → aplicar D7: USD principal, conversión secundaria.
- [x] Días restantes de T1 = 187 → debe ser 186 (cálculo en UTC contra `MOCK_NOW`).
- [x] "Convicción / Convicción Alta" repite la etiqueta → solo "Alta".
- [x] Tracker repite "Consenso en contra · acertó contra el consenso" → "Acertó contra el consenso · ▲96 ▼145".
- [x] Select nativo de divisa → `Select` de shadcn.
- [x] Fechas en mono ("15 de mar de 2027") → sans, formato corto.
- [ ] Votos que no parecen botones → `VoteControl` de D8. **Pendiente**: depende de la paleta dark de D8, se resuelve en el rediseño grande.
- [ ] Tres franjas con el mismo peso en las cards → jerarquía de D8. **Pendiente**: ídem, tipografía/paleta de D8.
- [ ] Sidebar flotando sin card y layout angosto en pantallas anchas → D4. **Pendiente**: requiere el shell nuevo (nav lateral + columna derecha con widgets) de D4.

---

## 9. Pendientes

- **Fechas**: relativas en card ("hace 3h"), absolutas en detalle con tooltip de fecha completa. Deadlines siempre absolutos + días restantes en tesis abiertas.
- **Estados de carga**: skeletons con la forma real de las cards (no spinners). "Ver más comentarios" y cambio de divisa con skeleton breve.
- **Estados vacíos**: pieza sin comentarios ("Todavía no hay comentarios. Sé el primero."), sin tesis abiertas, id inexistente (404 con "← Volver a NVDA").
- **Mobile / táctil**: convenciones de iOS HIG (targets 44 px, safe areas en barras sticky y tab bar, gesto de back).

---

## 10. Checklist de funcionalidad

- [ ] Shell: nav lateral (desktop), colapsada (tablet), tab bar (mobile); solo "Activos" funcional
- [ ] Header del activo con precio USD + conversión y selector de divisa
- [ ] 3 posteos y 2 tesis con toda la data del seed
- [ ] Columna derecha: tracker de tesis + actividad (desktop); franja de tesis (mobile/tablet)
- [ ] Votar desde card y detalle, con toggle y optimistic update
- [ ] Votos congelados en tesis cerrada
- [ ] Score neto con signo, neutro, tabular
- [ ] Bloque consenso vs. resultado en T2
- [ ] Detalle: panel lateral con URL (desktop), pantalla completa (mobile), página completa (entrada directa)
- [ ] Back nativo cierra el panel; scroll del feed preservado
- [ ] Comentarios paginados, sort, input funcional
- [ ] Barra sticky de votos/comentario en mobile
- [ ] Conversión de divisas sin alterar claim/target
- [ ] Skeletons y estados vacíos
- [ ] Accesibilidad: stretched link, aria-labels, foco visible, targets 44 px, reduced motion
- [ ] DECISIONS.md con el porqué de cada decisión (D1–D8 + pendientes resueltos)
