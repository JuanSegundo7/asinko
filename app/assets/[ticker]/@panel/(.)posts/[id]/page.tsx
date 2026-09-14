"use client"

import { useParams } from "next/navigation"
import { DetailPanel } from "@/components/detail/detail-panel"
import { PostDetail } from "@/components/content/post-detail"

/** D2: versión interceptada del detalle de posteo — se activa al navegar desde dentro de /assets/[ticker]/* (click en una card). Entrada directa por URL usa la página completa en posts/[id]/page.tsx. */
export default function InterceptedPostPanel() {
  const { ticker, id } = useParams<{ ticker: string; id: string }>()

  return (
    <DetailPanel>
      <PostDetail id={id} ticker={ticker} variant="panel" />
    </DetailPanel>
  )
}
