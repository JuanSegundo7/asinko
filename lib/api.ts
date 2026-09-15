import { asset, comments, exchangeRates, posts, priceHistory, theses } from "./mock-data"
import { MOCK_NOW } from "./format"
import { toggleVote } from "./vote"
import type {
  Comment,
  CommentSort,
  CommentWithReplies,
  Content,
  ExchangeRates,
  Post,
  PricePoint,
  Thesis,
  ThesisStatus,
  VoteDirection,
} from "./types"

function delay(minMs = 300, maxMs = 600): Promise<void> {
  const ms = minMs + Math.random() * (maxMs - minMs)
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeTicker(ticker: string): string {
  return ticker.toUpperCase()
}

/** Aplica el toggle de voto in-place sobre el registro "servidor" (el mock array es la única fuente de verdad). */
function applyVote<T extends { upvotes: number; downvotes: number; userVote: VoteDirection | null }>(
  item: T,
  direction: VoteDirection
): T {
  return Object.assign(item, toggleVote(item, direction))
}

export async function getAsset(ticker: string) {
  await delay()
  if (normalizeTicker(ticker) !== asset.ticker) return null
  return asset
}

/** Posteos (más recientes primero) y tesis (abiertas antes que cerradas, luego por recencia) de un activo. */
export async function getAssetContent(ticker: string) {
  await delay()
  if (normalizeTicker(ticker) !== asset.ticker) return null

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const sortedTheses = [...theses].sort((a, b) => {
    if (a.status !== b.status) return a.status === "OPEN" ? -1 : 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return { posts: sortedPosts, theses: sortedTheses }
}

export async function getPost(id: string): Promise<Post | null> {
  await delay()
  return posts.find((p) => p.id === id) ?? null
}

export async function getThesis(id: string): Promise<Thesis | null> {
  await delay()
  return theses.find((t) => t.id === id) ?? null
}

export async function getContent(id: string): Promise<Content | null> {
  await delay()
  return posts.find((p) => p.id === id) ?? theses.find((t) => t.id === id) ?? null
}

export async function getTheses(ticker: string, status?: ThesisStatus): Promise<Thesis[]> {
  await delay()
  if (normalizeTicker(ticker) !== asset.ticker) return []
  const filtered = status ? theses.filter((t) => t.status === status) : theses
  return [...filtered].sort((a, b) => {
    if (a.status !== b.status) return a.status === "OPEN" ? -1 : 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

/** Preview de 2 comentarios para la card — siempre los primeros en orden de carga (el par del seed), independiente de votos, para que la card no "parpadee" entre comentarios distintos a los del detalle. Solo de primer nivel: una respuesta nunca tiene sentido como preview fuera de su hilo. */
export async function getCommentPreview(contentId: string): Promise<Comment[]> {
  await delay()
  return comments.filter((c) => c.contentId === contentId && c.parentId === null).slice(0, 2)
}

/**
 * Paginación (D3, 5 por página) sobre comentarios de PRIMER NIVEL únicamente — cada uno vuelve con
 * TODAS sus respuestas ya resueltas (threading de un solo nivel: pocas respuestas por hilo, no
 * amerita paginación propia). El sort (TOP/RECENT) ordena los de primer nivel; las respuestas dentro
 * de cada hilo van siempre en orden cronológico ascendente, sea cual sea el sort activo — es
 * conversación, no un ranking.
 *
 * `totalTopLevel` es la base para "Ver N comentarios más" (cuenta lo que falta cargar en la
 * paginación); `totalAll` es el total real (primer nivel + respuestas) para el header "Comentarios (N)".
 */
export async function getComments(
  contentId: string,
  { offset = 0, limit = 5, sort = "TOP" as CommentSort } = {}
): Promise<{ items: CommentWithReplies[]; totalTopLevel: number; totalAll: number }> {
  await delay()
  const all = comments.filter((c) => c.contentId === contentId)
  const topLevel = all.filter((c) => c.parentId === null)

  const repliesByParent = new Map<string, Comment[]>()
  for (const c of all) {
    if (c.parentId === null) continue
    const list = repliesByParent.get(c.parentId) ?? []
    list.push(c)
    repliesByParent.set(c.parentId, list)
  }
  for (const list of repliesByParent.values()) {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  const sortedTopLevel = [...topLevel].sort((a, b) => {
    if (sort === "RECENT") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    return b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
  })

  const items: CommentWithReplies[] = sortedTopLevel.slice(offset, offset + limit).map((c) => ({
    ...c,
    replies: repliesByParent.get(c.id) ?? [],
  }))

  return { items, totalTopLevel: topLevel.length, totalAll: all.length }
}

export async function voteContent(id: string, direction: VoteDirection): Promise<Content> {
  await delay()
  const thesis = theses.find((t) => t.id === id)
  if (thesis) {
    if (thesis.status === "CLOSED") {
      throw new Error("Esta tesis está cerrada, la votación quedó congelada.")
    }
    return applyVote(thesis, direction)
  }

  const post = posts.find((p) => p.id === id)
  if (!post) throw new Error(`Contenido no encontrado: ${id}`)
  return applyVote(post, direction)
}

export async function voteComment(id: string, direction: VoteDirection): Promise<Comment> {
  await delay()
  const comment = comments.find((c) => c.id === id)
  if (!comment) throw new Error(`Comentario no encontrado: ${id}`)
  return applyVote(comment, direction)
}

export async function addComment(
  contentId: string,
  body: string,
  parentId: string | null = null
): Promise<Comment> {
  await delay()
  const parent =
    posts.find((p) => p.id === contentId) ?? theses.find((t) => t.id === contentId)
  if (!parent) throw new Error(`Contenido no encontrado: ${contentId}`)

  if (parentId) {
    const parentComment = comments.find((c) => c.id === parentId && c.contentId === contentId)
    if (!parentComment) throw new Error(`Comentario padre no encontrado: ${parentId}`)
    if (parentComment.parentId !== null) {
      throw new Error("No se puede responder a una respuesta (threading de un solo nivel).")
    }
  }

  const comment: Comment = {
    id: `c-${contentId}-${crypto.randomUUID()}`,
    contentId,
    parentId,
    author: { handle: "vos" },
    body,
    createdAt: MOCK_NOW.toISOString(),
    upvotes: 0,
    downvotes: 0,
    userVote: null,
  }

  comments.push(comment)
  parent.commentCount += 1
  return comment
}

export async function getExchangeRates(): Promise<ExchangeRates> {
  await delay()
  return exchangeRates
}

export async function getPriceHistory(ticker: string): Promise<PricePoint[] | null> {
  await delay()
  if (normalizeTicker(ticker) !== asset.ticker) return null
  return priceHistory
}
