import type { Post, Thesis } from "./types"

export type CommunityConsensus = {
  upvotes: number
  downvotes: number
  forPct: number // 0-100, entero
}

/**
 * Consenso agregado del activo: suma de upvotes/downvotes de TODOS los posteos + tesis (dato 100%
 * real, ya existe en cada pieza). Deliberadamente 2 baldes (a favor / en contra), no 3 — el modelo
 * de voto de Asinko es binario (UP | DOWN), un tercer balde "neutral" sería inventado.
 */
export function getCommunityConsensus(posts: Post[], theses: Thesis[]): CommunityConsensus {
  const all = [...posts, ...theses]
  const upvotes = all.reduce((sum, c) => sum + c.upvotes, 0)
  const downvotes = all.reduce((sum, c) => sum + c.downvotes, 0)
  const total = upvotes + downvotes
  const forPct = total === 0 ? 50 : Math.round((upvotes / total) * 100)
  return { upvotes, downvotes, forPct }
}

export type Contributor = {
  handle: string
  score: number
  postCount: number
  thesisCount: number
  hasCorrectThesis: boolean
}

/**
 * Ranking de contribuidores por score agregado (suma de upvotes−downvotes de sus propios posteos +
 * tesis en este activo) — no por "% de acierto": el seed solo tiene una tesis cerrada en total, no
 * alcanza para que un % de acierto por usuario signifique nada. `hasCorrectThesis` sí es honesto:
 * es cierto solo para quien tiene al menos una tesis cerrada y acertada.
 */
export function getTopContributors(posts: Post[], theses: Thesis[], limit = 3): Contributor[] {
  const byHandle = new Map<string, Contributor>()

  for (const piece of [...posts, ...theses]) {
    const handle = piece.author.handle
    const entry =
      byHandle.get(handle) ?? { handle, score: 0, postCount: 0, thesisCount: 0, hasCorrectThesis: false }
    entry.score += piece.upvotes - piece.downvotes
    if (piece.type === "POST") entry.postCount += 1
    else entry.thesisCount += 1
    byHandle.set(handle, entry)
  }

  for (const thesis of theses) {
    if (thesis.status === "CLOSED" && thesis.outcome === "CORRECT") {
      const entry = byHandle.get(thesis.author.handle)
      if (entry) entry.hasCorrectThesis = true
    }
  }

  return [...byHandle.values()].sort((a, b) => b.score - a.score).slice(0, limit)
}
