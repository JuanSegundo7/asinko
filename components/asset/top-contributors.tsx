import { CheckCircle2 } from "lucide-react"
import { SquircleSurface } from "@/components/ui/squircle-surface"
import { UserAvatar } from "@/components/shell/user-avatar"
import { getTopContributors } from "@/lib/community"
import { formatNetScore } from "@/lib/format"
import type { Post, Thesis } from "@/lib/types"

/**
 * D4: "Contribuidores destacados" — reemplazo honesto del ranking por "% de acierto" de la
 * referencia. El seed tiene una sola tesis cerrada en total (T2); rankear por acierto con un
 * solo dato real sería, en la práctica, inventar el resto. Se rankea por score agregado (suma de
 * upvotes−downvotes de los posteos + tesis propios de cada autor), dato ya real en cada card.
 * El badge "✓ acertó" solo aparece en quien de verdad tiene una tesis cerrada y acertada —
 * nadie más lo lleva, porque no hay con qué calcularlo.
 */
export function TopContributors({ posts, theses }: { posts: Post[]; theses: Thesis[] }) {
  const contributors = getTopContributors(posts, theses)

  if (contributors.length === 0) return null

  return (
    <SquircleSurface cornerRadius={20} elevation={1} className="p-4">
      <h2 className="text-sm font-medium text-muted-foreground">Contribuidores destacados</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {contributors.map((c) => (
          <li key={c.handle} className="flex items-center gap-3">
            <UserAvatar handle={c.handle} />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-1 truncate text-sm font-medium text-foreground">
                @{c.handle}
                {c.hasCorrectThesis && (
                  <span
                    className="inline-flex items-center gap-0.5 text-xs font-normal text-positive"
                    title="Tiene una tesis cerrada y acertada"
                  >
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    acertó
                  </span>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {c.pieceCount} pieza{c.pieceCount === 1 ? "" : "s"}
              </span>
            </div>
            <span className="font-mono text-sm tabular-nums text-foreground">{formatNetScore(c.score)}</span>
          </li>
        ))}
      </ul>
    </SquircleSurface>
  )
}
