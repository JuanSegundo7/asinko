"use client"

import Link from "next/link"
import { ArrowDown, ArrowUp } from "lucide-react"
import { SquircleSurface } from "@/components/ui/squircle-surface"
import { ThesisStatusBadge } from "@/components/content/thesis-status-badge"
import { getConsensus, getConsensusMismatchLabel } from "@/lib/consensus"
import { daysRemaining, formatAbsolute, formatCurrency, formatPercent } from "@/lib/format"
import { markCameFromFeed } from "@/lib/scroll-restoration"
import type { Asset, Thesis } from "@/lib/types"

/** Sidebar sticky desktop (D4): no duplica las cards, una línea compacta por tesis con el dato que la card no muestra a simple vista. */
export function ThesisTracker({ theses, asset }: { theses: Thesis[]; asset: Asset }) {
  if (theses.length === 0) return null

  return (
    <SquircleSurface
      as="nav"
      aria-label="Thesis tracker"
      cornerRadius={20}
      elevation={1}
      className="flex flex-col gap-2 p-4"
    >
      <h2 className="text-sm font-medium text-muted-foreground">Theses ({theses.length})</h2>
      <ul className="flex flex-col gap-1">
        {theses.map((thesis) => (
          <li key={thesis.id}>
            <TrackerRow thesis={thesis} assetPriceUsd={asset.price} />
          </li>
        ))}
      </ul>
      <Link
        href={`/assets/${asset.ticker.toLowerCase()}/theses`}
        onClick={() => markCameFromFeed()}
        className="mt-1 flex min-h-11 items-center text-sm font-medium text-foreground hover:underline"
      >
        See all →
      </Link>
    </SquircleSurface>
  )
}

function TrackerRow({ thesis, assetPriceUsd }: { thesis: Thesis; assetPriceUsd: number }) {
  const href = `/assets/${thesis.assetTicker.toLowerCase()}/theses/${thesis.id}`
  const DirectionIcon = thesis.direction === "ABOVE" ? ArrowUp : ArrowDown

  return (
    <Link
      href={href}
      scroll={false}
      onClick={() => markCameFromFeed(href)}
      className="flex flex-col gap-1 rounded-md p-2 text-sm hover:bg-accent"
    >
      <ThesisStatusBadge status={thesis.status} outcome={thesis.outcome} />
      {thesis.status === "OPEN" ? (
        <p className="text-muted-foreground">
          <DirectionIcon className="mr-0.5 inline size-3.5" aria-hidden="true" />
          {formatCurrency(thesis.targetPrice, "USD")} · {formatAbsolute(thesis.deadline)}
          <br />
          <span className="tabular-nums">
            {formatPercent(((thesis.targetPrice - assetPriceUsd) / assetPriceUsd) * 100)} ·{" "}
            {daysRemaining(thesis.deadline)} days
          </span>
        </p>
      ) : (
        <p className="text-muted-foreground">
          <DirectionIcon className="mr-0.5 inline size-3.5" aria-hidden="true" />
          {formatCurrency(thesis.targetPrice, "USD")} · {formatAbsolute(thesis.deadline)}
          <br />
          {getConsensusMismatchLabel(thesis) ??
            (getConsensus(thesis) === "FOR" ? "Consensus for" : "Consensus against")}
          {" · "}
          <span className="tabular-nums">
            ▲{thesis.upvotes} ▼{thesis.downvotes}
          </span>
        </p>
      )}
    </Link>
  )
}
