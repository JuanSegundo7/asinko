"use client"

import { useParams } from "next/navigation"
import { AssetHeader } from "@/components/asset/asset-header"
import { ThesisStrip } from "@/components/asset/thesis-strip"
import { PanelWidgets } from "@/components/asset/panel-widgets"
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

      <div className="mx-auto w-full max-w-[100rem] flex-1 px-4 py-6 xl:grid xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start xl:gap-8 2xl:px-8">
        <main className="flex min-w-0 flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Posteos{content ? ` (${content.posts.length})` : ""}
            </h2>
            {/* Grid fluido en vez de columnas fijas: fuerza "3 en línea" solo cuando cada card tiene al menos 320px reales, si no baja a 2/1 en vez de apretar el preview de comentarios (line-clamp-2) hasta romperlo. */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
              {contentPending ? (
                <>
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </>
              ) : (
                content?.posts.map((post, i) => (
                  <div
                    key={post.id}
                    className="stagger-item"
                    style={{ "--stagger-index": i } as React.CSSProperties}
                  >
                    <PostCard post={post} className="h-full" />
                  </div>
                ))
              )}
            </div>
          </section>

          <section id="tesis" className="flex scroll-mt-4 flex-col gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Tesis{content ? ` (${content.theses.length})` : ""}
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-4">
              {contentPending ? (
                <>
                  <CardSkeleton />
                  <CardSkeleton />
                </>
              ) : (
                content?.theses.map((thesis, i) => (
                  <div
                    key={thesis.id}
                    className="stagger-item"
                    style={{ "--stagger-index": i } as React.CSSProperties}
                  >
                    <ThesisCard thesis={thesis} className="h-full" />
                  </div>
                ))
              )}
            </div>
          </section>
        </main>

        {asset && content && <PanelWidgets asset={asset} posts={content.posts} theses={content.theses} />}
      </div>
    </div>
  )
}
