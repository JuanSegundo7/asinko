import type { Thesis } from "./types"

export type Consensus = "FOR" | "AGAINST"

export function getConsensus(thesis: Pick<Thesis, "upvotes" | "downvotes">): Consensus {
  return thesis.upvotes >= thesis.downvotes ? "FOR" : "AGAINST"
}

/** "Acertó/Falló contra el consenso" solo cuando el resultado difiere de lo que votó la comunidad; null si coinciden. */
export function getConsensusMismatchLabel(thesis: Thesis): string | null {
  if (thesis.status !== "CLOSED" || !thesis.outcome) return null

  const consensus = getConsensus(thesis)
  const outcomeIsCorrect = thesis.outcome === "CORRECT"
  const matches = (consensus === "FOR" && outcomeIsCorrect) || (consensus === "AGAINST" && !outcomeIsCorrect)
  if (matches) return null

  return outcomeIsCorrect ? "Right against consensus" : "Wrong despite consensus"
}
