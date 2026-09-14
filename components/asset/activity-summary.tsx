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
      <h2 className="text-sm font-medium text-muted-foreground">Actividad</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        <span className="font-mono tabular-nums text-foreground">{totalPieces}</span> publicaciones
        {" · "}
        <span className="font-mono tabular-nums text-foreground">{totalComments}</span> comentarios
        {" · "}
        <span className="font-mono tabular-nums text-foreground">{correctAgainstConsensus}</span> tesis
        acertada{correctAgainstConsensus === 1 ? "" : "s"} contra el consenso
      </p>
    </SquircleSurface>
  )
}
