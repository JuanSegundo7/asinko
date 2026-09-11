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
4. No inventar datos que no se deriven del seed (sin sentimiento %, rankings de contribuidores, métricas de rendimiento, market cap, gráficos, etc.). Excepción justificada: precio actual mock y tipos de cambio mock.
5. Contexto **global**, no enfocado en ningún país.

---

## 2. Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind** + **shadcn/ui**
- **TanStack Query** sobre una capa de API mock
- **Lucide** para íconos
- Sin base de datos ni backend real

### Capa de datos

- `lib/api.ts`: funciones async que devuelven el mock con un delay chico (~300–600 ms). Es la única pieza a reemplazar si hubiera backend.
- TanStack Query encima para: votos y comentarios con **optimistic updates + rollback**, estados de carga reales (skeletons), paginación de comentarios y carga de tipos de cambio.
- Card y detalle leen del **mismo caché**: si votás en el feed y entrás al detalle, el voto ya está reflejado.
- Estado de cliente mínimo: la divisa va en search param (`?currency=EUR`), no en un store.
- Fechas relativas calculadas contra un `MOCK_NOW` fijo (`2026-09-10`) para que "hace 3h", "faltan 186 días", etc. sean consistentes con el seed siempre.

---

## 3. Decisiones cerradas

### D1 — Votos vs. resultado en tesis

- En tesis **abierta**, votar = "¿creés que va a pasar?". En posteo = "¿aporta?".
- Al **cerrarse** una tesis, los votos se **congelan**: el conteo final es el registro histórico de lo que creía la comunidad. Botones deshabilitados con label/tooltip "Votación cerrada", tanto en card como en detalle.
- En la tesis cerrada se muestran las dos dimensiones: **consenso** (a favor / en contra según el score) y **resultado** (acertada / incorrecta, precio y fecha de resolución).
- Si consenso y resultado no coinciden, badge derivado: **"Acertó contra el consenso"** (o "Falló pese al consenso").

### D2 — Vista de detalle

- **Página con URL propia** (no drawer/modal). Back nativo, link compartible, historial.
- Al volver, se **preserva la posición de scroll** del feed. Probarlo explícitamente.
- Header del detalle con "← NVDA" siempre visible.
- **Mobile**: barra de votos + input de comentario **sticky abajo**, al alcance del pulgar.
- **Desktop**: aprovechar el ancho (contenido + comentarios en dos columnas, o una columna centrada de lectura cómoda).
- El drawer en desktop queda como mejora opcional si sobra tiempo.

### D3 — Comentarios

- El seed trae 2 comentarios por pieza pero los contadores dicen más. **Se completa el mock** para que los números coincidan (ver sección 5).
- **Card**: 2 comentarios de preview (como en el seed).
- **Detalle**: primeros 5 + botón "Ver N comentarios más" que carga el resto con TanStack Query (skeleton breve).
- Orden: toggle simple de dos opciones **"Más votados · Recientes"** (default: más votados). Por eso los comentarios tienen votos en el mock.
- Input para escribir comentario en el detalle; el nuevo comentario aparece arriba (optimistic).

### D4 — Estructura de la página del activo

```
DESKTOP
┌─────────────────────────────────────────────────┐
│ NVDA · NVIDIA Corp. · $185.20 · [USD ▾]         │
├────────────────────────────────┬─────────────────┤
│ POSTEOS (3)                    │ TESIS (2)        │
│ [post] [post] [post]           │                  │
│                                 │ ● Abierta        │
│ TESIS (2)                      │ ▲ $250 · 15 mar  │
│ [tesis completa]               │ +35% · 186 días  │
│ [tesis completa]               │                  │
│                                 │ ● Acertada       │
│                                 │ ▼ $200 · 30 jun  │
│                                 │ contra consenso  │
│                                 │ Ver todas →      │
└────────────────────────────────┴─────────────────┘
```

- **Posteos arriba** (lectura rápida, puerta de entrada), **tesis abajo**.
- Dentro de posteos: más recientes primero. Dentro de tesis: abiertas antes que cerradas, luego por recencia.
- **Sidebar sticky (desktop) = tracker de tesis**, no una lista duplicada de cards: una línea compacta por tesis con el dato que la card no muestra a simple vista (abierta: distancia al target y días restantes; cerrada: resultado y consenso). Cada ítem lleva al detalle.
- "Ver todas →" lleva a `/assets/nvda/theses` con filtro "Abiertas · Cerradas" (demuestra que escala).
- **Mobile**: sin sidebar. Franja compacta bajo el header: "2 tesis · 1 abierta · 1 acertada"; al tocarla hace scroll a la sección de tesis.

### D5 — Cards

**Card de tesis** lleva toda la data del seed: tipo, estado, tiempo de publicación, claim, autor, grilla de datos, razonamiento completo (sin truncar), votos + score, contador de comentarios, 2 comentarios de preview.

- Grilla de 4 celdas, **contextual**: la celda "Activo $NVDA" es redundante dentro de la página de NVDA, así que se reemplaza por:
  - Abierta → "Precio actual $185.20 · faltan +35%"
  - Cerrada → "Cerró en $178.40"
  - El campo `asset` se mantiene en el modelo y se muestra solo fuera de la página del activo (perfil, feed general).
- Precio objetivo con **dirección**: ▲ superará / ▼ no superará.
- Convicción: indicador de **4 segmentos** (Baja/Media/Alta/Extrema) + texto (accesibilidad).
- Diferenciación visual clara entre estado Abierta y Cerrada · Acertada/Incorrecta.

**Card de posteo**: autor, tiempo, texto completo, votos + score, contador, 2 comentarios de preview. Sin imágenes ni emojis (el contenido no los tiene).

**Votar desde la card** (sin entrar al detalle):

- Patrón **stretched link**: el claim/texto es el `<a>` real con pseudo-elemento que cubre la card; los botones de voto quedan encima con `z-index`. Nunca `<button>` dentro de `<a>`.
- Footer de votos separado por una línea, como zona propia.
- Área táctil mínima **44×44 px** por botón.
- Toggle: tocar de nuevo quita el voto; tocar el opuesto lo cambia. Feedback inmediato (optimistic).
- El contador "N comentarios" es link a `…/[id]#comentarios` con foco en el input.

### D6 — Puntaje

- `score = upvotes − downvotes`, mostrado **al lado de los votos** en card y detalle:
  ```
  ▲ 312  ▼ 28   +284
  ▲ 96   ▼ 145  −49
  ```
- **Color neutro** para el score, positivo o negativo. El color se reserva para "tu voto" (▲ activo verde, ▼ activo rojo). Un negativo no es un error: la tesis −49 acertó.
- Signo menos real `−` (U+2212). Score 0 se muestra "0" sin signo.
- `font-variant-numeric: tabular-nums` para que nada se mueva al votar.
- `aria-label`: "96 votos a favor, 145 en contra, puntaje −49".

### D7 — Divisas

- Divisas: **USD, EUR, GBP, JPY** (JPY a propósito: sin decimales).
- Formato con **`Intl.NumberFormat`** (símbolo, separadores y decimales por divisa/locale).
- Selector en un único lugar: el header del activo. Default según locale del navegador, persistido en la URL.
- Regla clave: **el claim, el precio objetivo y la resolución de una tesis siempre quedan en la moneda nativa del activo (USD)**. La conversión aparece solo como referencia secundaria ("≈ €231"), con tipo de cambio mock fijo y visible. Motivo: si el target se convirtiera, se movería con el tipo de cambio y la tesis podría parecer más cerca o lejos del objetivo sin que NVDA se mueva.
- Tipos de cambio mock (1 USD =): EUR 0.92 · GBP 0.79 · JPY 147. Cargados vía TanStack Query con delay.

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
  createdAt: string       // ISO, relativo a MOCK_NOW
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

Para que los contadores coincidan hay que generar: **P1 +2 · P2 +5 · P3 +1 · T1 +10 · T2 +7** (25 en total).

Pautas: mismos usuarios del seed (@martincode, @valeinversora, @shortandlong, @deep.value, @florv, @renelong) + como mucho 2–3 nuevos; mismo tono (breve, técnico, en español rioplatense neutro); que discutan el argumento concreto de cada pieza; votos variados en los comentarios; fechas posteriores a la publicación de la pieza. En T2, algunos comentarios anteriores al cierre y alguno posterior reconociendo el resultado.

---

## 6. Rutas

```
/                               → redirect a /assets/nvda
/assets/[ticker]                → página del activo
/assets/[ticker]/posts/[id]     → detalle de posteo
/assets/[ticker]/theses/[id]    → detalle de tesis
/assets/[ticker]/theses         → todas las tesis (filtro Abiertas · Cerradas)
```

## 7. Estructura sugerida

```
app/
  assets/[ticker]/
    page.tsx
    posts/[id]/page.tsx
    theses/page.tsx
    theses/[id]/page.tsx
components/
  asset/      AssetHeader, CurrencySelector, ThesisTracker, ThesisStrip (mobile)
  content/    PostCard, ThesisCard, ThesisDataGrid, ConvictionMeter,
              ThesisStatusBadge, ConsensusVsOutcome, VoteControl, Score
  comments/   CommentList, CommentItem, CommentPreview, CommentInput, CommentSort
  ui/         (shadcn)
lib/
  types.ts
  mock-data.ts
  api.ts          // funciones async con delay
  queries.ts      // hooks de TanStack Query
  format.ts       // Intl.NumberFormat, fechas relativas vs MOCK_NOW, signo −
```

---

## 8. Pendientes (para definir con el agente de diseño)

Propuestas iniciales, abiertas a discusión:

- **Fechas**: relativas en card ("hace 3h"), absolutas en detalle con `title`/tooltip de la fecha completa. Deadlines siempre absolutos ("15 mar 2027") + días restantes en tesis abiertas.
- **Estados de carga**: skeletons con la forma real de las cards (no spinners). Carga de "ver más comentarios" y cambio de divisa con skeleton breve.
- **Estados vacíos**: pieza sin comentarios ("Todavía no hay comentarios. Sé el primero."), sección sin tesis abiertas, ruta con id inexistente (404 con "← Volver a NVDA").
- **Sistema visual**: paleta, tipografía y estilo de componentes. Evitar el look genérico de dashboard dark shadcn; buscar identidad propia (la estética editorial/monoespaciada del seed puede ser punto de partida, no para copiar). UI mayormente neutral; verde/rojo solo para votos activos y resultado de tesis.
- **Mobile / táctil**: seguir convenciones de iOS HIG (targets 44 px, safe areas en barras sticky, gesto de back).

---

## 9. Checklist de funcionalidad

- [ ] Header del activo con precio mock y selector de divisa
- [ ] 3 posteos y 2 tesis con toda la data del seed
- [ ] Tracker de tesis (desktop) y franja de tesis (mobile)
- [ ] Votar desde card y detalle, con toggle y optimistic update
- [ ] Votos congelados en tesis cerrada
- [ ] Score neto con signo, neutro, tabular
- [ ] Bloque consenso vs. resultado en T2
- [ ] Click en card → detalle con URL propia; back con scroll preservado
- [ ] Comentarios paginados, sort, input funcional
- [ ] Barra sticky de votos/comentario en mobile
- [ ] Conversión de divisas sin alterar claim/target
- [ ] Skeletons y estados vacíos
- [ ] Accesibilidad: stretched link, aria-labels, foco visible, targets 44 px
- [ ] DECISIONS.md con el porqué de cada decisión (D1–D7 + pendientes resueltos)
