import type { VoteDirection, UserVote } from "./types"

export type Votable = {
  upvotes: number
  downvotes: number
  userVote: UserVote
}

/** Calcula el nuevo estado de voto: votar de nuevo lo quita, votar el opuesto lo cambia. Pura — no muta. */
export function toggleVote<T extends Votable>(item: T, direction: VoteDirection): T {
  let { upvotes, downvotes, userVote } = item

  if (userVote === direction) {
    if (direction === "UP") upvotes -= 1
    else downvotes -= 1
    userVote = null
  } else {
    if (userVote === "UP") upvotes -= 1
    if (userVote === "DOWN") downvotes -= 1
    if (direction === "UP") upvotes += 1
    else downvotes += 1
    userVote = direction
  }

  return { ...item, upvotes, downvotes, userVote }
}
