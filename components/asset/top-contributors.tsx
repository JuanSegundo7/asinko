"use client"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { cn } from "cn"
import { SquircleSurface } from "@/components/ui/squircle-surface"
import { UserAvatar } from "@/components/shell/user-avatar"
import { DetailPanel } from "@/components/detail/detail-panel"
import { getTopContributors, type Contributor } from "@/lib/community"
import { getConsensusMismatchLabel } from "@/lib/consensus"
import { formatNetScore } from "@/lib/format"
import type { Post, Thesis } from "@/lib/types"

const COMPACT_LIMIT = 3

/** "1 post", "2 theses", "1 post, 1 thesis" — plural irregular de "thesis" a mano, sin librería para un solo caso. */
function formatPieceBreakdown(postCount: number, thesisCount: number): string {
  const parts: string[] = []
  if (postCount > 0) parts.push(`${postCount} post${postCount === 1 ? "" : "s"}`)
  if (thesisCount > 0) parts.push(`${thesisCount} ${thesisCount === 1 ? "thesis" : "theses"}`)
  return parts.join(", ")
}

/**
 * D4: "Contribuidores destacados" — reemplazo honesto del ranking por "% de acierto" de la
 * referencia. El seed tiene una sola tesis cerrada en total (T2); rankear por acierto con un
 * solo dato real sería, en la práctica, inventar el resto. Se rankea por score agregado (suma de
 * upvotes−downvotes de los posteos + tesis propios de cada autor), dato ya real en cada card.
 * El badge "✓ acertó" solo aparece en quien de verdad tiene una tesis cerrada y acertada —
 * nadie más lo lleva, porque no hay con qué calcularlo.
 */
export function TopContributors({ posts, theses }: { posts: Post[]; theses: Thesis[] }) {
  const [showAll, setShowAll] = useState(false)
  const all = getTopContributors(posts, theses, Infinity)
  const compact = all.slice(0, COMPACT_LIMIT)

  if (compact.length === 0) return null

  /**
   * D9 revisitado: el único contribuidor con `hasCorrectThesis` puede tener score neto negativo
   * (la comunidad votó en contra y de todas formas acertó — exactamente la idea central del
   * producto) y quedar afuera del top 3 por puro orden de score. Sin este pin, esa historia
   * queda invisible salvo que se abra el drawer — justo lo opuesto de lo que el producto quiere
   * mostrar. El ranking por score NO cambia (sigue neutral, D8); esto solo garantiza visibilidad.
   */
  const pinned = all.filter(
    (c) => c.hasCorrectThesis && !compact.some((x) => x.handle === c.handle)
  )

  return (
    <>
      <SquircleSurface cornerRadius={20} elevation={1} className="p-4">
        <h2 className="text-sm font-medium text-muted-foreground">Top contributors</h2>
        <ContributorList contributors={compact} className="mt-3" />

        {pinned.length > 0 && (
          <ul className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
            {pinned.map((c) => {
              const thesis = theses.find(
                (t) => t.author.handle === c.handle && t.status === "CLOSED" && t.outcome === "CORRECT"
              )
              const metaLabel = (thesis && getConsensusMismatchLabel(thesis)) ?? "Correct thesis"
              return <ContributorRow key={c.handle} contributor={c} metaLabel={metaLabel} />
            })}
          </ul>
        )}

        {all.length > compact.length && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="press-feedback mt-2 flex min-h-11 items-center text-sm font-medium text-foreground hover:underline"
          >
            See more →
          </button>
        )}
      </SquircleSurface>

      {/* Hermano de SquircleSurface, no hijo: SquircleSurface recorta con clip-path (esquinas
          squircle), y clip-path en un ancestro convierte a ese ancestro en el containing block de
          `position: fixed` — el drawer quedaría atrapado y recortado dentro de la card chica en
          vez de cubrir la pantalla si viviera adentro. */}
      {showAll && (
        <DetailPanel title="Top contributors" onClose={() => setShowAll(false)}>
          <div className="p-4">
            <p className="mb-4 text-sm text-muted-foreground">
              Full ranking by aggregate score (sum of upvotes−downvotes across their posts and theses on {""}
              {posts[0]?.assetTicker ?? theses[0]?.assetTicker}).
            </p>
            <ContributorList contributors={all} showRank />
          </div>
        </DetailPanel>
      )}
    </>
  )
}

function ContributorList({
  contributors,
  className,
  showRank = false,
}: {
  contributors: Contributor[]
  className?: string
  showRank?: boolean
}) {
  return (
    <ul className={cn("flex flex-col", showRank ? "gap-1" : "gap-3", className)}>
      {contributors.map((c, i) => (
        <ContributorRow
          key={c.handle}
          contributor={c}
          rank={showRank ? i + 1 : undefined}
          className={showRank ? "border-b border-border py-3 last:border-b-0" : undefined}
        />
      ))}
    </ul>
  )
}

function ContributorRow({
  contributor: c,
  rank,
  metaLabel,
  className,
}: {
  contributor: Contributor
  rank?: number
  /** Default: desglose "N post(s), M thesis/theses". Override para casos especiales (ej. la fila pinneada de "acertó"). */
  metaLabel?: string
  className?: string
}) {
  return (
    <li className={cn("flex items-center gap-3", className)}>
      {rank !== undefined && (
        <span className="w-5 shrink-0 text-center font-mono text-sm text-muted-foreground">{rank}</span>
      )}
      <UserAvatar handle={c.handle} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-1 truncate text-sm font-medium text-foreground">
          @{c.handle}
          {c.hasCorrectThesis && (
            <span
              className="inline-flex items-center gap-0.5 text-xs font-normal text-positive"
              title="Has a closed, correct thesis"
            >
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              correct
            </span>
          )}
        </span>
        <span className="text-xs text-muted-foreground">
          {metaLabel ?? formatPieceBreakdown(c.postCount, c.thesisCount)}
        </span>
      </div>
      <span className="font-mono text-sm tabular-nums text-foreground">{formatNetScore(c.score)}</span>
    </li>
  )
}
