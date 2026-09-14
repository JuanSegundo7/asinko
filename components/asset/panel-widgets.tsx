import { ThesisTracker } from "./thesis-tracker"
import { ActivitySummary } from "./activity-summary"
import { CommunityConsensus } from "./community-consensus"
import { TopContributors } from "./top-contributors"
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
