"use client"

import { useParams } from "next/navigation"
import { DetailPanel } from "@/components/detail/detail-panel"
import { ThesisDetail } from "@/components/content/thesis-detail"

/** D2: versión interceptada del detalle de tesis. Ahora vive bajo `theses/@panel` (no en `[ticker]/@panel`), así que solo intercepta navegaciones que se originan desde `/assets/[ticker]/theses` (el listado) — ver theses/layout.tsx para el porqué. Entrada directa por URL o click desde fuera de ese subárbol (feed, ThesisTracker) usa la página completa en `theses/[id]/page.tsx`. */
export default function InterceptedThesisPanel() {
  const { ticker, id } = useParams<{ ticker: string; id: string }>()

  return (
    <DetailPanel hideHeaderBelowXl>
      <ThesisDetail id={id} ticker={ticker} variant="panel" />
    </DetailPanel>
  )
}
