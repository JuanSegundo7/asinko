import { SquircleSurface } from "@/components/ui/squircle-surface"
import { getCommunityConsensus } from "@/lib/community"
import type { Post, Thesis } from "@/lib/types"

const RADIUS = 26
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * D4: "Consenso de la comunidad" — reemplazo honesto de "Sentimiento" de la referencia. 2 baldes
 * (a favor / en contra), no 3: el modelo de voto de Asinko es binario (UP | DOWN), un tercer
 * balde "neutral" sería inventado. Dato 100% real: suma de upvotes/downvotes de todos los
 * posteos + tesis del activo (ver lib/community.ts).
 *
 * Color: azul accent para "a favor" (mismo que el badge "Abierta"), gris neutro para "en contra"
 * — deliberadamente sin verde/rojo acá: esto sí es score/voto de la comunidad, el dominio exacto
 * donde D8 reserva el color para "tu voto activo" y el resultado de una tesis.
 */
export function CommunityConsensus({ posts, theses }: { posts: Post[]; theses: Thesis[] }) {
  const { upvotes, downvotes, forPct } = getCommunityConsensus(posts, theses)
  const forLength = (forPct / 100) * CIRCUMFERENCE

  return (
    <SquircleSurface cornerRadius={20} elevation={1} className="p-4">
      <h2 className="text-sm font-medium text-muted-foreground">Community consensus</h2>
      <div className="mt-3 flex items-center gap-4">
        <svg
          viewBox="0 0 64 64"
          className="size-16 shrink-0 -rotate-90"
          role="img"
          aria-label={`${forPct}% of votes for, ${100 - forPct}% against, out of ${upvotes + downvotes} total votes`}
        >
          <circle cx="32" cy="32" r={RADIUS} fill="none" strokeWidth="8" className="stroke-border" />
          <circle
            cx="32"
            cy="32"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${forLength} ${CIRCUMFERENCE - forLength}`}
            className="stroke-primary"
          />
        </svg>
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="font-mono text-xl font-semibold tabular-nums text-foreground">{forPct}%</span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
            For · <span className="font-mono tabular-nums">{upvotes}</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full bg-border" aria-hidden="true" />
            Against · <span className="font-mono tabular-nums">{downvotes}</span>
          </span>
        </div>
      </div>
    </SquircleSurface>
  )
}
