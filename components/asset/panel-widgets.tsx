import { cn } from "cn"
import { ThesisTracker } from "./thesis-tracker"
import { ActivitySummary } from "./activity-summary"
import { CommunityConsensus } from "./community-consensus"
import { TopContributors } from "./top-contributors"
import { SquircleSurface } from "@/components/ui/squircle-surface"
import { Skeleton } from "@/components/ui/skeleton"
import type { Asset, Post, Thesis } from "@/lib/types"

/** D4: contenido normal de la columna derecha, visible solo a partir de xl. Usado tanto por @panel/default.tsx como por el fallback de [ticker]/layout.tsx (ver ahí el porqué). */
export function PanelWidgets({
  asset,
  posts,
  theses,
}: {
  asset: Asset
  posts: Post[]
  theses: Thesis[]
}) {
  return (
    <div className="hidden flex-col gap-4 xl:sticky xl:top-6 xl:flex">
      <CommunityConsensus posts={posts} theses={theses} />
      <TopContributors posts={posts} theses={theses} />
      <ThesisTracker theses={theses} asset={asset} />
      <ActivitySummary posts={posts} theses={theses} />
    </div>
  )
}

/** Placeholder de la columna derecha: mismo ancho/posición sticky, sin reproducir cada widget exacto. */
export function PanelWidgetsSkeleton() {
  // Alturas aproximadas de CommunityConsensus, TopContributors, ThesisTracker y ActivitySummary,
  // en ese orden — no hace falta calcar cada widget, solo que la columna no salte al llegar la data.
  const heights = ["h-24", "h-32", "h-28", "h-16"]

  return (
    <div className="hidden flex-col gap-4 xl:sticky xl:top-6 xl:flex">
      {heights.map((h, i) => (
        <SquircleSurface key={i} cornerRadius={20} elevation={1} className="flex flex-col gap-3 p-4">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className={cn("w-full", h)} />
        </SquircleSurface>
      ))}
    </div>
  )
}
