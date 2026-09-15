import type { Asset, Comment, ExchangeRates, Post, PricePoint, Thesis } from "./types"

/** Semilla de un comentario sin `parentId` explícito — se completa a `null` al construir `comments` (ver más abajo), así no hace falta repetir `parentId: null` en los 25 comentarios de primer nivel que ya estaban en el seed. */
type SeedComment = Omit<Comment, "parentId"> & { parentId?: string | null }
import { MOCK_NOW } from "./format"

const ASSET_PRICE = 185.2
const HISTORY_DAYS = 400
/** T2 (semilla) cerró en $178.40 el 2026-06-30: la serie de precio tiene que pasar por ese punto exacto para no contradecir un dato que ya está en el seed. */
const T2_RESOLUTION_DATE = "2026-06-30T21:00:00.000Z"
const T2_RESOLUTION_PRICE = 178.4

/** PRNG determinístico (sin dependencias) — misma semilla siempre da la misma serie entre reloads, nunca Math.random() en cada render. */
function mulberry32(seed: number) {
  return function random() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Serie de precio mock: caminata aleatoria de semilla fija, reescalada para terminar exactamente
 * en `finalPrice` el día de hoy (MOCK_NOW), con una corrección lineal suave en el tramo final para
 * que además pase exacto por el cierre real de T2 el día de su resolución — así el gráfico nunca
 * contradice un número que el propio seed ya fija.
 */
function buildPriceHistory(finalPrice: number): PricePoint[] {
  const rand = mulberry32(20260910)
  const levels: number[] = []
  let level = 1
  for (let i = 0; i < HISTORY_DAYS; i++) {
    const change = (rand() - 0.47) * 0.035 // leve sesgo alcista, volatilidad diaria ~1.7%
    level *= 1 + change
    levels.push(level)
  }

  const scale = finalPrice / levels[levels.length - 1]
  const scaled = levels.map((l) => l * scale)

  const idxEnd = HISTORY_DAYS - 1
  const daysAgoT2 = Math.round((MOCK_NOW.getTime() - new Date(T2_RESOLUTION_DATE).getTime()) / 86_400_000)
  const idxT2 = idxEnd - daysAgoT2
  const rawT2 = scaled[idxT2]
  const rawEnd = scaled[idxEnd]
  for (let i = idxT2; i <= idxEnd; i++) {
    const t = (i - idxT2) / (idxEnd - idxT2)
    const linearTarget = T2_RESOLUTION_PRICE + t * (finalPrice - T2_RESOLUTION_PRICE)
    const linearRaw = rawT2 + t * (rawEnd - rawT2)
    scaled[i] += linearTarget - linearRaw
  }
  scaled[idxT2] = T2_RESOLUTION_PRICE
  scaled[idxEnd] = finalPrice

  return scaled.map((close, i) => {
    const daysAgo = idxEnd - i
    const date = new Date(MOCK_NOW.getTime() - daysAgo * 86_400_000)
    return { date: date.toISOString(), close: Math.round(close * 100) / 100 }
  })
}

export const priceHistory: PricePoint[] = buildPriceHistory(ASSET_PRICE)

/** ATH derivado de la propia serie (no un número suelto) — así nunca puede quedar por debajo del precio actual o de algún punto histórico por error de tipeo. */
const athPoint = priceHistory.reduce((max, p) => (p.close > max.close ? p : max), priceHistory[0])

export const asset: Asset = {
  ticker: "NVDA",
  name: "NVIDIA Corp.",
  sector: "Semiconductors",
  currency: "USD",
  price: ASSET_PRICE,
  sharesOutstanding: 24_300_000_000, // mock, orden de magnitud real de NVDA — market cap se deriva de esto, no es un campo suelto
  volume24h: 28_400_000_000, // mock
  athPrice: athPoint.close,
  athDate: athPoint.date,
}

export const exchangeRates: ExchangeRates = {
  EUR: 0.92,
  GBP: 0.79,
  JPY: 147,
}

export const posts: Post[] = [
  {
    id: "p1",
    type: "POST",
    assetTicker: "NVDA",
    author: { handle: "martincode" },
    createdAt: "2026-09-10T09:00:00.000Z", // hace 3h
    upvotes: 128,
    downvotes: 12,
    commentCount: 4,
    body: "The new Blackwell architecture is already dominating hyperscaler orders. Microsoft and Meta confirmed expanded orders for next quarter. The bottleneck is still TSMC packaging capacity, not demand.",
    userVote: null,
  },
  {
    id: "p2",
    type: "POST",
    assetTicker: "NVDA",
    author: { handle: "valeinversora" },
    createdAt: "2026-09-09T12:00:00.000Z", // hace 1 día
    upvotes: 74,
    downvotes: 31,
    commentCount: 7,
    body: "At 35x forward earnings, the market is already pricing in several years of growth at current rates. I'm not saying it's a bad company, I'm saying the price leaves little room for error.",
    userVote: null,
  },
  {
    id: "p3",
    type: "POST",
    assetTicker: "NVDA",
    author: { handle: "shortandlong" },
    createdAt: "2026-09-08T12:00:00.000Z", // hace 2 días
    upvotes: 45,
    downvotes: 9,
    commentCount: 3,
    body: "The CEO sold another tranche of shares this week. Several insiders have been unloading positions over the past few months. Is anyone else tracking this?",
    userVote: null,
  },
]

export const theses: Thesis[] = [
  {
    id: "t1",
    type: "THESIS",
    assetTicker: "NVDA",
    author: { handle: "deep.value" },
    createdAt: "2026-09-06T12:00:00.000Z", // hace 4 días
    upvotes: 312,
    downvotes: 28,
    commentCount: 12,
    claim: "$NVDA will exceed $250 before March 15, 2027",
    direction: "ABOVE",
    targetPrice: 250,
    deadline: "2027-03-15T23:59:59.000Z",
    conviction: "HIGH",
    reasoning:
      "Hyperscaler capex on AI infrastructure keeps accelerating heading into 2027, and NVIDIA holds a dominant share in both training and inference. The CUDA ecosystem raises switching costs and supports the current multiple.",
    status: "OPEN",
    outcome: null,
    resolvedAt: null,
    resolutionPrice: null,
    userVote: null,
  },
  {
    id: "t2",
    type: "THESIS",
    assetTicker: "NVDA",
    author: { handle: "shortandlong" },
    createdAt: "2026-06-10T12:00:00.000Z", // hace 3 meses
    upvotes: 96,
    downvotes: 145,
    commentCount: 9,
    claim: "$NVDA will not exceed $200 before June 30, 2026",
    direction: "BELOW",
    targetPrice: 200,
    deadline: "2026-06-30T23:59:59.000Z",
    conviction: "MEDIUM",
    reasoning:
      "Hyperscalers' in-house chips have been replacing a growing share of their internal demand, and AMD is closing the performance gap faster than the market is pricing in. This is a margin-compression thesis, not a collapse thesis.",
    status: "CLOSED",
    outcome: "CORRECT",
    resolvedAt: "2026-06-30T21:00:00.000Z",
    resolutionPrice: 178.4,
    userVote: null,
  },
]

const rawComments: SeedComment[] = [
  // --- P1 (seed 2 + 2 extra = 4) ---
  {
    id: "c-p1-1",
    contentId: "p1",
    author: { handle: "florv" },
    body: "Any source for those numbers, or is it just what's being said in the industry?",
    createdAt: "2026-09-10T09:30:00.000Z",
    upvotes: 8,
    downvotes: 1,
    userVote: null,
  },
  {
    id: "c-p1-2",
    contentId: "p1",
    author: { handle: "renelong" },
    body: "The CoWoS bottleneck has been there since 2023, it's not new.",
    createdAt: "2026-09-10T10:00:00.000Z",
    upvotes: 14,
    downvotes: 0,
    userVote: null,
  },
  {
    id: "c-p1-3",
    contentId: "p1",
    author: { handle: "deep.value" },
    body: "If the bottleneck is packaging and not demand, the read for 2027 is different from what the market is pricing in today.",
    createdAt: "2026-09-10T10:30:00.000Z",
    upvotes: 6,
    downvotes: 0,
    userVote: null,
  },
  {
    id: "c-p1-4",
    contentId: "p1",
    author: { handle: "valeinversora" },
    body: "Agreed, but that also means the growth consensus is already focused where it should be, so it shouldn't surprise anyone in the price.",
    createdAt: "2026-09-10T11:00:00.000Z",
    upvotes: 3,
    downvotes: 2,
    userVote: null,
  },
  {
    // Respuesta del autor del posteo a la pregunta de @florv sobre fuentes (c-p1-1) — threading de un solo nivel (D-threading).
    id: "c-p1-r1",
    contentId: "p1",
    parentId: "c-p1-1",
    author: { handle: "martincode" },
    body: "There's no formal report yet, it's a read on sell-side notes post-earnings from Microsoft and Meta plus what's circulating in the industry — nothing I can link as a single source.",
    createdAt: "2026-09-10T09:45:00.000Z",
    upvotes: 5,
    downvotes: 0,
    userVote: null,
  },

  // --- P2 (seed 2 + 5 extra = 7) ---
  {
    id: "c-p2-1",
    contentId: "p2",
    author: { handle: "deep.value" },
    body: "It depends on what growth you assume for data center in 2026. That's where the debate is.",
    createdAt: "2026-09-09T14:00:00.000Z",
    upvotes: 11,
    downvotes: 1,
    userVote: null,
  },
  {
    id: "c-p2-2",
    contentId: "p2",
    author: { handle: "martincode" },
    body: "35x forward with revenue growing 80% year-over-year doesn't strike me as expensive.",
    createdAt: "2026-09-09T15:00:00.000Z",
    upvotes: 19,
    downvotes: 4,
    userVote: null,
  },
  {
    id: "c-p2-3",
    contentId: "p2",
    author: { handle: "florv" },
    body: "The forward multiple assumes that 80% holds up, and that's where everyone plugs in their own number.",
    createdAt: "2026-09-09T16:00:00.000Z",
    upvotes: 9,
    downvotes: 0,
    userVote: null,
  },
  {
    id: "c-p2-4",
    contentId: "p2",
    author: { handle: "shortandlong" },
    body: "Agreed with vale: when everyone assumes growth stays the same is exactly when it pays to be more conservative.",
    createdAt: "2026-09-09T17:00:00.000Z",
    upvotes: 7,
    downvotes: 5,
    userVote: null,
  },
  {
    id: "c-p2-5",
    contentId: "p2",
    author: { handle: "renelong" },
    body: "35x in semis has historically compressed fast as soon as growth slows down, demand doesn't need to collapse for that.",
    createdAt: "2026-09-09T18:00:00.000Z",
    upvotes: 12,
    downvotes: 2,
    userVote: null,
  },
  {
    id: "c-p2-6",
    contentId: "p2",
    author: { handle: "quantcarla" },
    body: "Vale's point isn't that NVDA is a bad company, it's that the margin for error on negative surprises is thin at this multiple.",
    createdAt: "2026-09-10T08:00:00.000Z",
    upvotes: 5,
    downvotes: 0,
    userVote: null,
  },
  {
    id: "c-p2-7",
    contentId: "p2",
    author: { handle: "martincode" },
    body: "There I agree: the risk isn't the underlying thesis, it's how the price reacts to any bump in the road.",
    createdAt: "2026-09-10T09:00:00.000Z",
    upvotes: 4,
    downvotes: 0,
    userVote: null,
  },
  {
    // Respuesta de la autora del posteo a @martincode (c-p2-2), aclarando su punto sobre margen de error.
    id: "c-p2-r1",
    contentId: "p2",
    parentId: "c-p2-2",
    author: { handle: "valeinversora" },
    body: "My point isn't that 80% is expensive, it's that sustaining it is what needs to be questioned — that's the margin for error I mention in the post.",
    createdAt: "2026-09-09T15:30:00.000Z",
    upvotes: 9,
    downvotes: 1,
    userVote: null,
  },

  // --- P3 (seed 2 + 1 extra = 3) ---
  {
    id: "c-p3-1",
    contentId: "p3",
    author: { handle: "florv" },
    body: "Most of these are scheduled sales (10b5-1), it's not necessarily a signal.",
    createdAt: "2026-09-08T13:00:00.000Z",
    upvotes: 10,
    downvotes: 1,
    userVote: null,
  },
  {
    id: "c-p3-2",
    contentId: "p3",
    author: { handle: "valeinversora" },
    body: "Scheduled or not, the volume has been climbing quarter over quarter.",
    createdAt: "2026-09-08T15:00:00.000Z",
    upvotes: 6,
    downvotes: 2,
    userVote: null,
  },
  {
    id: "c-p3-3",
    contentId: "p3",
    author: { handle: "macrofede" },
    body: "The volume is up because the compensation package also grew; you have to look at it as % of holdings, not absolute amount.",
    createdAt: "2026-09-08T17:00:00.000Z",
    upvotes: 8,
    downvotes: 0,
    userVote: null,
  },
  {
    // Respuesta del autor del posteo a @florv (c-p3-1) sobre las ventas programadas.
    id: "c-p3-r1",
    contentId: "p3",
    parentId: "c-p3-1",
    author: { handle: "shortandlong" },
    body: "Scheduled or not, how many tranches get set up is also a decision — it's not a completely neutral data point.",
    createdAt: "2026-09-08T13:20:00.000Z",
    upvotes: 6,
    downvotes: 1,
    userVote: null,
  },

  // --- T1 (seed 2 + 10 extra = 12) ---
  {
    id: "c-t1-1",
    contentId: "t1",
    author: { handle: "shortandlong" },
    body: "The CUDA argument is the strongest one here, more than the short-term growth story.",
    createdAt: "2026-09-06T14:00:00.000Z",
    upvotes: 41,
    downvotes: 2,
    userVote: null,
  },
  {
    id: "c-t1-2",
    contentId: "t1",
    author: { handle: "renelong" },
    body: "What happens to this thesis if a hyperscaler announces its own chip at scale?",
    createdAt: "2026-09-06T17:00:00.000Z",
    upvotes: 28,
    downvotes: 1,
    userVote: null,
  },
  {
    id: "c-t1-3",
    contentId: "t1",
    author: { handle: "deep.value" },
    body: "There are already several announced (Trainium, TPU, MTIA) and none has taken meaningful share from NVIDIA yet; the software ecosystem matters more than the silicon.",
    createdAt: "2026-09-06T18:00:00.000Z",
    upvotes: 33,
    downvotes: 3,
    userVote: null,
  },
  {
    id: "c-t1-4",
    contentId: "t1",
    author: { handle: "martincode" },
    body: "The risk I see isn't the in-house chip, it's the pace of capex if there's a sharp macro correction.",
    createdAt: "2026-09-07T12:00:00.000Z",
    upvotes: 19,
    downvotes: 4,
    userVote: null,
  },
  {
    id: "c-t1-5",
    contentId: "t1",
    author: { handle: "valeinversora" },
    body: "186 days gives a lot of room, but also a lot of time for the 2027 consensus to shift.",
    createdAt: "2026-09-07T15:00:00.000Z",
    upvotes: 12,
    downvotes: 6,
    userVote: null,
  },
  {
    id: "c-t1-6",
    contentId: "t1",
    author: { handle: "florv" },
    body: "Does the high conviction account for any multiple-compression scenario even if the business keeps growing?",
    createdAt: "2026-09-07T18:00:00.000Z",
    upvotes: 9,
    downvotes: 0,
    userVote: null,
  },
  {
    id: "c-t1-7",
    contentId: "t1",
    author: { handle: "quantcarla" },
    body: "With the current EPS consensus, $250 implies a reasonable multiple if data center growth holds up, it's not an extreme bet.",
    createdAt: "2026-09-08T12:00:00.000Z",
    upvotes: 22,
    downvotes: 1,
    userVote: null,
  },
  {
    id: "c-t1-8",
    contentId: "t1",
    author: { handle: "shortandlong" },
    body: "Keep in mind that 'reasonable' today depends on no hyperscaler cutting capex guidance; that's where I'd look first.",
    createdAt: "2026-09-08T16:00:00.000Z",
    upvotes: 17,
    downvotes: 3,
    userVote: null,
  },
  {
    id: "c-t1-9",
    contentId: "t1",
    author: { handle: "renelong" },
    body: "CUDA is a real moat, but it's also the part most likely to draw regulatory/antitrust pressure in 2026-2027.",
    createdAt: "2026-09-08T20:00:00.000Z",
    upvotes: 8,
    downvotes: 2,
    userVote: null,
  },
  {
    id: "c-t1-10",
    contentId: "t1",
    author: { handle: "macrofede" },
    body: "Agreed with deep.value: the software lock-in is the least-discussed part of the thesis and probably the most important.",
    createdAt: "2026-09-09T12:00:00.000Z",
    upvotes: 15,
    downvotes: 0,
    userVote: null,
  },
  {
    id: "c-t1-11",
    contentId: "t1",
    author: { handle: "martincode" },
    body: "High conviction seems well placed to me: the main risk is timing, not direction.",
    createdAt: "2026-09-09T17:00:00.000Z",
    upvotes: 11,
    downvotes: 1,
    userVote: null,
  },
  {
    id: "c-t1-12",
    contentId: "t1",
    author: { handle: "deep.value" },
    body: "I'll update if anything concrete on 2027 capex comes out in the next earnings reports.",
    createdAt: "2026-09-09T20:00:00.000Z",
    upvotes: 14,
    downvotes: 0,
    userVote: null,
  },
  {
    // Respuesta de @renelong a la respuesta de @deep.value (c-t1-3) sobre chips propios de hyperscalers.
    id: "c-t1-r1",
    contentId: "t1",
    parentId: "c-t1-3",
    author: { handle: "renelong" },
    body: "Agreed there, though Trainium 3 is already in Amazon's internal production at a larger scale than previous generations — the question is whether that moves anything beyond their own consumption.",
    createdAt: "2026-09-06T19:00:00.000Z",
    upvotes: 10,
    downvotes: 1,
    userVote: null,
  },

  // --- T2 (seed 2 + 7 extra = 9; mezcla de comentarios previos y posteriores al cierre 2026-06-30) ---
  {
    id: "c-t2-1",
    contentId: "t2",
    author: { handle: "deep.value" },
    body: "Custom silicon has been 'about to arrive' for years and the software gap is still huge.",
    createdAt: "2026-06-11T12:00:00.000Z",
    upvotes: 52,
    downvotes: 8,
    userVote: null,
  },
  {
    id: "c-t2-2",
    contentId: "t2",
    author: { handle: "martincode" },
    body: "Agreed on direction, disagree on timing: I thought this would play out in 2027-2028.",
    createdAt: "2026-06-13T12:00:00.000Z",
    upvotes: 38,
    downvotes: 5,
    userVote: null,
  },
  {
    id: "c-t2-3",
    contentId: "t2",
    author: { handle: "renelong" },
    body: "Margin compression already started showing up in last quarter's gross margin; the thesis has more support than the score reflects.",
    createdAt: "2026-06-15T12:00:00.000Z",
    upvotes: 29,
    downvotes: 6,
    userVote: null,
  },
  {
    id: "c-t2-4",
    contentId: "t2",
    author: { handle: "valeinversora" },
    body: "145 against seems to me like it underestimates how much hyperscalers' internal demand is still growing.",
    createdAt: "2026-06-20T12:00:00.000Z",
    upvotes: 8,
    downvotes: 22,
    userVote: null,
  },
  {
    id: "c-t2-5",
    contentId: "t2",
    author: { handle: "quantcarla" },
    body: "With just days left until the deadline, $200 is still out of reach short of a very strong rally between now and 6/30.",
    createdAt: "2026-06-25T12:00:00.000Z",
    upvotes: 14,
    downvotes: 3,
    userVote: null,
  },
  {
    id: "c-t2-6",
    contentId: "t2",
    author: { handle: "martincode" },
    body: "Closed at $178.40: the thesis was right, and against the voting consensus on top of that. Hats off here.",
    createdAt: "2026-07-01T12:00:00.000Z",
    upvotes: 61,
    downvotes: 2,
    userVote: null,
  },
  {
    id: "c-t2-7",
    contentId: "t2",
    author: { handle: "deep.value" },
    body: "I'll admit I voted against this, and the margin-compression argument from custom silicon + AMD ended up being more decisive than I thought.",
    createdAt: "2026-07-02T12:00:00.000Z",
    upvotes: 47,
    downvotes: 1,
    userVote: null,
  },
  {
    id: "c-t2-8",
    contentId: "t2",
    author: { handle: "florv" },
    body: "The interesting part is that the price didn't collapse, it compressed gradually just like the thesis said; it wasn't a panic event.",
    createdAt: "2026-07-05T12:00:00.000Z",
    upvotes: 20,
    downvotes: 0,
    userVote: null,
  },
  {
    id: "c-t2-9",
    contentId: "t2",
    author: { handle: "macrofede" },
    body: "Good reminder that the community score measures expectation, not certainty: 145 against, and it still turned out correct.",
    createdAt: "2026-07-10T12:00:00.000Z",
    upvotes: 25,
    downvotes: 3,
    userVote: null,
  },
  {
    // Respuesta del autor de la tesis al reconocimiento de @martincode (c-t2-6) tras el cierre.
    id: "c-t2-r1",
    contentId: "t2",
    parentId: "c-t2-6",
    author: { handle: "shortandlong" },
    body: "Thanks — what surprised me most was that the market only caught on once the thesis had already resolved.",
    createdAt: "2026-07-01T14:00:00.000Z",
    upvotes: 18,
    downvotes: 0,
    userVote: null,
  },
]

export const comments: Comment[] = rawComments.map((c) => ({ ...c, parentId: c.parentId ?? null }))

/**
 * `commentCount` (top-level + respuestas) se recalcula acá a partir del array real de comentarios,
 * igual que `athPrice`/`athDate` se derivan de `priceHistory` más arriba — nunca un número suelto
 * que se pueda desincronizar del seed. El valor puesto en cada objeto de `posts`/`theses` arriba es
 * el conteo original del seed (documentación de la consigna); este loop lo pisa con el real.
 */
function countComments(contentId: string): number {
  return comments.filter((c) => c.contentId === contentId).length
}
for (const post of posts) post.commentCount = countComments(post.id)
for (const thesis of theses) thesis.commentCount = countComments(thesis.id)
