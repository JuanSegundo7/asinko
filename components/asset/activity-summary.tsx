import { SquircleSurface } from "@/components/ui/squircle-surface"
import { getConsensusMismatchLabel } from "@/lib/consensus"
import type { Post, Thesis } from "@/lib/types"

/** D4: segundo widget de la columna derecha — todo derivado del seed (sin métricas inventadas). "Publicaciones" cuenta posteos + tesis (piezas de contenido), no solo posteos. */
export function ActivitySummary({ posts, theses }: { posts: Post[]; theses: Thesis[] }) {
  const totalPieces = posts.length + theses.length
  const totalComments = [...posts, ...theses].reduce((sum, c) => sum + c.commentCount, 0)
  const correctAgainstConsensus = theses.filter(
    (t) => t.outcome === "CORRECT" && getConsensusMismatchLabel(t) !== null
  ).length

  return (
    <SquircleSurface cornerRadius={20} elevation={1} className="p-4">
      <h2 className="text-sm font-medium text-muted-foreground">Activity</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        <span className="font-mono tabular-nums text-foreground">{totalPieces}</span> posts
        {" · "}
        <span className="font-mono tabular-nums text-foreground">{totalComments}</span> comments
        {" · "}
        <span className="font-mono tabular-nums text-foreground">{correctAgainstConsensus}</span>{" "}
        {correctAgainstConsensus === 1 ? "thesis" : "theses"} correct against consensus
      </p>
    </SquircleSurface>
  )
}
