"use client"

import { useParams } from "next/navigation"
import { AssetHeader } from "@/components/asset/asset-header"
import { ThesisTracker } from "@/components/asset/thesis-tracker"
import { ThesisStrip } from "@/components/asset/thesis-strip"
import { PostCard } from "@/components/content/post-card"
import { ThesisCard } from "@/components/content/thesis-card"
import { CardSkeleton } from "@/components/content/card-skeleton"
import { NotFoundPanel } from "@/components/not-found-panel"
import { useAssetContentQuery, useAssetQuery } from "@/lib/queries"

export default function AssetPage() {
  const { ticker } = useParams<{ ticker: string }>()
  const { data: asset, isPending: assetPending } = useAssetQuery(ticker)
  const { data: content, isPending: contentPending } = useAssetContentQuery(ticker)

  if (!assetPending && asset === null) {
    return (
      <NotFoundPanel
        message={`No encontramos el activo "${ticker.toUpperCase()}".`}
        backHref="/assets/nvda"
        backLabel="Volver a NVDA"
      />
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      {asset && <AssetHeader asset={asset} />}
      {content && <ThesisStrip theses={content.theses} />}

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
        <main className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Posteos{content ? ` (${content.posts.length})` : ""}
            </h2>
            {contentPending ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              content?.posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </section>

          <section id="tesis" className="flex scroll-mt-4 flex-col gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Tesis{content ? ` (${content.theses.length})` : ""}
            </h2>
            {contentPending ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              content?.theses.map((thesis) => <ThesisCard key={thesis.id} thesis={thesis} />)
            )}
          </section>
        </main>

        {asset && content && (
          <aside className="hidden lg:sticky lg:top-6 lg:block lg:h-fit">
            <ThesisTracker theses={content.theses} asset={asset} />
          </aside>
        )}
      </div>
    </div>
  )
}
